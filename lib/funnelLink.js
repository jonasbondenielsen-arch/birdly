// ============================================================================
// FUNNEL-LINKET — hvad der føres med ind i /start, og hvad der ikke gør.
//
// ⚠️ HVORFOR PARAMETRENE SKAL MED. Kæden er:
//     Meta-annonce → /kom-i-gang?fag=rengoring&utm_campaign=… → /start
// Tabes ?fag= på vejen, mister en besøgende fra "Rengøringsopgaver" sit forvalg
// ét skridt før mål, og hele pointen med en fag-specifik annonce falder på gulvet.
//
// ⚠️ UTM'ERNE ER BÆLTE OG SELER, IKKE ENESTE VÆRN. lib/attribution.js fanger dem
// allerede ved landing og lægger dem i sessionStorage, så målingen overlever
// selv hvis linket er nøgent. Men sessionStorage kan fejle (privat browsing,
// kvote), og en adresselinje man kan se er lettere at fejlsøge end en nøgle man
// skal ind i devtools for at læse. Derfor begge dele.
//
// ⚠️ HVIDLISTE, IKKE "tag alt med". En rå videreførsel af hele query'en ville
// sende hvad som helst nogen hænger på adressen videre ind i funnelen — og
// /start læser selv ?betaling= og ?vis=, som ikke må kunne sættes udefra på
// vejen ind. Derfor kun de nøgler vi selv udgiver.
// ============================================================================

// Forvalg fra fag- og geo-siderne. Valideres IKKE her — det gør /start mod
// kataloget, så der kun findes ÉT sted hvor en værdi bliver troet på.
const FORVALG = ["fag", "region"];

// Kampagne-parametre. Samme liste som UTM_FELTER i lib/attribution.js, plus
// Metas klik-id. ⚠️ Holdes i takt med den fil: står en nøgle kun ét af stederne,
// bliver den enten fanget uden at kunne ses, eller ført videre uden at blive gemt.
const KAMPAGNE = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "hook", "angle", "fbclid", "campaign_id", "adset_id", "ad_id",
];

const TILLADT = [...FORVALG, ...KAMPAGNE];

// Loft pr. værdi. Samme 200 tegn som attributionen og som signup-funktionens
// rensning, så en adresse ikke kan gøres vilkårligt lang på vejen igennem.
const MAKS = 200;

/**
 * Byg et link videre i kæden med de parametre der må følge med.
 *
 * @param {string} sti          "/start" eller "/kom-i-gang"
 * @param {object} sp           searchParams fra Next (værdier kan være array)
 * @param {object} [overstyr]   nøgler der skal sættes/overskrives, fx { fag: "vvs" }
 */
export function medQuery(sti, sp, overstyr = {}) {
  const qs = new URLSearchParams();

  for (const n of TILLADT) {
    // ⚠️ Next giver et ARRAY hvis parameteren står to gange (?fag=a&fag=b).
    // Uden det her ville værdien blive strengen "a,b" og aldrig matche et fag.
    const raa = sp?.[n];
    const v = Array.isArray(raa) ? raa[0] : raa;
    if (v == null || v === "") continue;
    qs.set(n, String(v).slice(0, MAKS));
  }

  // Et eksplicit valg slår adressen. Klikker kunden på fag-kortet "VVS", er DET
  // hendes fag — også selvom hun kom ind på ?fag=tomrer.
  for (const [n, v] of Object.entries(overstyr)) {
    if (v == null || v === "") qs.delete(n);
    else qs.set(n, String(v).slice(0, MAKS));
  }

  const s = qs.toString();
  return s ? `${sti}?${s}` : sti;
}
