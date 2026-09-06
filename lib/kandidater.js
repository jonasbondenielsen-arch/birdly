const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ============================================================================
// Hvor mange opgaver passer til et kriteriesæt — FØR kunden er oprettet.
//
// Kalder preview-kandidater (birdly-admin), som bruger SELVE match-reglen
// (birdly_match_candidates_for, 0064). Tallet i funnelen kan derfor ikke afvige
// fra det kunden bagefter får.
//
// → { i_omraade, paa_landsplan, effektive_koder }
//
// ⚠️ effektive_koder = 0 betyder "der er ikke valgt nogen koder" — IKKE "der er
// ingen opgaver". De 13 fag uden bred kode rammer det hvis man kun sender fag_keys.
// Kalderen SKAL sende fagets koder og skelne de to slags nul. Se visResultat().
//
// Fejler kaldet, returnerer vi nuller. Trin 3 viser da "vi holder øje"-teksten,
// som er sand uanset — et gættet tal ville være værre end intet tal.
// ============================================================================
// ⚠️ med_eksempler ER ET TILVALG. Uden det svarer Edge Function'en praecis som
// foer, og funnelens tal-kald er dermed uaendret. Med det faar vi hoejst 3 AEGTE
// opgaver fra det SAMME kandidatsaet som tallet — titel, koeber, frist, beloeb.
// Ingen id'er, ingen CPV, ingen NUTS, aldrig esender.
//
// ⚠️ EKSEMPLERNE KAN MANGLE, OG DET ER EN NORMALTILSTAND. Er den nye version af
// funktionen ikke rullet ud endnu, findes feltet slet ikke i svaret — da faar vi
// en tom liste, og kalderen skal vise tallet uden kort frem for at finde paa
// noget. Samme regel som for tallet selv: hellere mindre bevis end falsk bevis.
export async function hentKandidater({ fag_keys, cpv_selections, bredde, region_keys, min_amount, max_amount, med_eksempler = false }) {
  const tom = { i_omraade: 0, paa_landsplan: 0, effektive_koder: 0, eksempler: [], fejlede: true };
  if (!SUPABASE_URL) return tom;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/preview-kandidater`, {
      method: "POST",
      headers: {
        apikey: ANON || "",
        Authorization: `Bearer ${ANON || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fag_keys, cpv_selections, bredde, region_keys, min_amount, max_amount, ...(med_eksempler ? { med_eksempler: true } : {}) }),
      cache: "no-store",
    });
    const b = await res.json().catch(() => null);
    if (!res.ok || !b?.ok) return tom;
    return {
      i_omraade: Number(b.i_omraade) || 0,
      paa_landsplan: Number(b.paa_landsplan) || 0,
      effektive_koder: Number(b.effektive_koder) || 0,
      // Kun raekker med en titel slipper igennem — en tom streng ville rendere
      // som et blankt kort der ligner en fejl.
      eksempler: Array.isArray(b.eksempler) ? b.eksempler.filter((n) => n?.titel) : [],
      fejlede: false,
    };
  } catch {
    return tom;
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
