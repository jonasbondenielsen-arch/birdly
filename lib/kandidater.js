const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ============================================================================
// Hvor mange opgaver passer til et kriteriesæt — FØR kunden er oprettet.
//
// Kalder preview-kandidater (birdly-admin), som bruger SELVE match-reglen
// (birdly_match_candidates_for, 0064). Tallet i funnelen kan derfor ikke afvige
// fra det kunden bagefter får.
//
// → { i_omraade, paa_landsplan, effektive_koder, eksempler }
//
// ⚠️ effektive_koder = 0 betyder "der er ikke valgt nogen koder" — IKKE "der er
// ingen opgaver". De 13 fag uden bred kode rammer det hvis man kun sender fag_keys.
// Kalderen SKAL sende fagets koder og skelne de to slags nul. Se visResultat().
//
// Fejler kaldet, returnerer vi nuller. Trin 3 viser da "vi holder øje"-teksten,
// som er sand uanset — et gættet tal ville være værre end intet tal.
// ============================================================================
// ⚠️ `med_eksempler` BLEV SENDT MEN ALDRIG VIDEREGIVET (rettet 23-09-2026).
// Begge kaldesteder i Start.js har hele tiden bedt om eksempler, og denne
// funktion droppede parameteren tavst: den stod ikke i destruktureringen og
// derfor heller ikke i kroppen. Kodekommentaren ved Birdly-scanningen lovede
// "op til tre AF DE SAMME opgaver tallet er regnet paa" - det skete aldrig.
// Kunden saa et tal, aldrig en opgave.
// ⚠️ ÉT TAL, ÉT STED. Bruges af både timeouten og den årsag der rapporteres,
// så de to aldrig kan komme til at sige noget forskelligt.
export const SCAN_TIMEOUT_MS = 15000;

export async function hentKandidater({ fag_keys, cpv_selections, bredde, region_keys, min_amount, max_amount, med_eksempler }) {
  // ⚠️ `eksempler: []` OGSAA I FEJLTILSTANDEN. Kalderen maa aldrig skulle
  // skelne mellem "ingen eksempler" og "feltet findes ikke".
  // ⚠️ `aarsag` SKAL MED, OG DET ER HELE POINTEN (06-10-2026). `fejlede: true`
  // alene kunne ikke skelne en 500 fra en timeout fra et manglende miljø — og
  // ingen af dem kunne skelnes fra "kunden har bare nul matches", fordi
  // `visResultat()` kollapser alle tre til "intet". En teknisk fejl blev dermed
  // målt som et produktresultat.
  const tom = (aarsag) => ({
    i_omraade: 0, paa_landsplan: 0, effektive_koder: 0, eksempler: [],
    fejlede: true, aarsag,
  });
  if (!SUPABASE_URL) return tom("ingen_url");

  // ⚠️ TIMEOUT, FORDI ET HÆNGENDE KALD VAR USYNLIGT. Uden den kunne `await`
  // stå indtil browseren selv gav op; kunden så spinneren, og vi så ingenting.
  // 15 s er rundhåndet mod et langsomt opslag og kort nok til at kunden får et
  // svar frem for en evig spinner.
  const ctrl = new AbortController();
  const ur = setTimeout(() => ctrl.abort(), SCAN_TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/preview-kandidater`, {
      signal: ctrl.signal,
      method: "POST",
      headers: {
        apikey: ANON || "",
        Authorization: `Bearer ${ANON || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fag_keys, cpv_selections, bredde, region_keys, min_amount, max_amount, med_eksempler: med_eksempler === true }),
      cache: "no-store",
    });
    const b = await res.json().catch(() => null);
    // ⚠️ HTTP-FEJL OG "SVAR UDEN ok" ER TO FORSKELLIGE TING. Den første er
    // infrastruktur, den anden er serverens eget nej — og statuskoden følger
    // med, så en 429 kan skelnes fra en 500 i analysen.
    if (!res.ok) return tom("http_" + res.status);
    if (!b?.ok) return tom("svar_ikke_ok");
    return {
      i_omraade: Number(b.i_omraade) || 0,
      paa_landsplan: Number(b.paa_landsplan) || 0,
      effektive_koder: Number(b.effektive_koder) || 0,
      // ⚠️ KUN DE FEM HVIDLISTEDE FELTER SLIPPER IGENNEM, ogsaa selv om
      // serveren en dag skulle sende flere. To hvidlister i traek er ikke
      // dobbeltarbejde: den ene beskytter mod en fremtidig serveraendring,
      // den anden mod en fremtidig klientaendring.
      eksempler: Array.isArray(b.eksempler)
        ? b.eksempler.slice(0, 3).map((e) => ({
            title: e?.title ?? null,
            buyer_name: e?.buyer_name ?? null,
            deadline: e?.deadline ?? null,
            amount: e?.amount ?? null,
            currency: e?.currency ?? null,
          }))
        : [],
      fejlede: false,
      aarsag: null,
    };
  } catch (e) {
    // ⚠️ EN AFBRUDT FETCH ER EN TIMEOUT, IKKE EN NETVÆRKSFEJL. `AbortError` er
    // den ENESTE måde at se forskel på "serveren svarede aldrig i tid" og
    // "forbindelsen fejlede" — og de to kræver hver sin handling af os.
    return tom(e?.name === "AbortError" ? "timeout" : "netvaerk");
  } finally {
    clearTimeout(ur);
  }
}

// Hvilken af de tre sandheder skal trin 3 vise?
//
//   "lokalt"    der er noget i kundens område        → vis DET tal
//   "landsplan" 0 i området, men noget i faget       → vis landstallet SOM landstal,
//                                                      plus en handling (udvid område)
//   "intet"     0 begge steder, eller vi ved det ikke → ren "vi holder øje"-tekst
//
// ⚠️ Landstallet må ALDRIG præsenteres som om det var i kundens område. Det er
// forskellen på et ærligt løfte og et salgstrick, og den ligger her i ét sted frem
// for spredt ud i JSX.
export function visResultat(k) {
  if (!k || k.fejlede || k.effektive_koder === 0) return "intet";
  if (k.i_omraade > 0) return "lokalt";
  if (k.paa_landsplan > 0) return "landsplan";
  return "intet";
}
