import { baseUrl } from "./markets";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ============================================================================
// KATALOGET FOR ET BESTEMT MARKED — hentet på SERVEREN.
//
// ⚠️ HVORFOR IKKE `fetchCatalog()` FRA KLIENTEN.
// `lib/catalog.js` kalder get-catalog fra browseren og sender intet
// markedssignal. Edge Function'en udleder markedet af Origin, og på en
// Vercel-preview er Origin `*.vercel.app` — ingen markeds vært. Den ville
// derfor svare DK, og den britiske funnel ville vise DANMARKS 21 fag og
// DANSKE regioner under engelsk overskrift. Ikke en fejlbesked: forkerte
// data der ser rigtige ud.
//
// Her spørges der i stedet på serveren, hvor markedet allerede er afgjort.
//
// ⚠️ `?market=` VIRKER KUN MOD ET DRAFT-MARKED, og det afgøres server-side i
// Edge Function'en mod `markets.launch_status` — ikke her. Et lanceret marked
// er altid vært-bundet. Døren lukker sig selv den dag GB lanceres, og så
// falder vi tilbage på værten, som da svarer GB af sig selv.
//
// ⚠️ SVARET VERIFICERES. Samme disciplin som `hentOpgaveTal`: får vi et andet
// marked end det vi bad om, returnerer vi null frem for at vise det. En funnel
// med det forkerte markeds fag er værre end ingen funnel — kunden ville vælge
// et fag vi aldrig kan matche hende på.
// ============================================================================

const REVALIDER_SEK = 300;

export async function katalogFor(marked) {
  if (!SUPABASE_URL || !ANON) return null;
  try {
    const u = new URL(`${SUPABASE_URL}/functions/v1/get-catalog`);
    u.searchParams.set("market", marked);

    // ⚠️ BEGGE VEJE, OG DET ER EN FREMTIDSSIKRING - IKKE BÆLTE OG SELER.
    // `get-catalog` opløser markedet i to trin: (1) kendt vært vinder altid,
    // (2) ellers honoreres `?market=` for et DRAFT-marked.
    //
    // Så længe GB er DRAFT bærer parameteren opslaget. Men den dag GB LANCERES,
    // lukker dør (2) sig selv — med vilje — og uden en Origin ville det her
    // kald falde tilbage til DK. Den britiske funnel ville da vise Danmarks 21
    // fag, tavst, netop i det øjeblik markedet gik i luften.
    //
    // Ved at sende markedets egen vært med, går kaldet gennem trin (1) i det
    // sekund domænet er tændt i `market_domains` — og parameteren bliver den
    // fallback den var tænkt som. Ingen af delene skal huskes senere.
    const vaert = baseUrl(marked);
    const res = await fetch(u, {
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        ...(vaert ? { Origin: vaert } : {}),
      },
      next: { revalidate: REVALIDER_SEK },
    });
    if (!res.ok) return null;
    const b = await res.json();

    // ⚠️ VERIFICÉR PÅ DET DER FAKTISK BRUGES. `hentOpgaveTal` lærte det på den
    // hårde måde: den validerede på et felt der var blevet fjernet, returnerede
    // null for alt, og skjulte bevis-bjælken på hele sitet uden én fejl i
    // loggen. Funnelen bruger fag og regioner — så det er dem der tjekkes.
    if (!Array.isArray(b?.fag) || !Array.isArray(b?.regions)) return null;
    if (!b.fag.length || !b.regions.length) return null;

    // ⚠️ GET-CATALOG SVARER IKKE MED SIT MARKED, så uenigheden kan ikke ses
    // direkte. Den kan derimod MÆRKES: får vi Danmarks katalog, er der 21 fag
    // med danske navne. Vi kender GB's forventede form — ét fag — og et
    // katalog der ikke ligner det, er ikke vores.
    //
    // ⚠️ DET HER ER EN FORMKONTROL, IKKE EN FAG-TÆLLING SOM REGEL. Får GB
    // flere fag den dag mappingen udvides, må kontrollen ikke begynde at fejle.
    // Derfor tjekkes der på det der ikke må ske: at kataloget indeholder fag
    // vi VED er danske.
    const danskeNoegler = ["tomrer", "murer", "maler", "vvs", "elektriker"];
    if (b.fag.some((f) => danskeNoegler.includes(f.key))) {
      console.warn(`[katalog] bad om ${marked}, fik et katalog med danske fag — bruger det ikke`);
      return null;
    }
    return b;
  } catch {
    return null;
  }
}
