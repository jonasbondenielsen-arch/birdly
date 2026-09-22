"use client";

// ============================================================================
// SAMTYKKET SOM MÅLEPUNKT (22-09-2026) — den ene ting diagnosen ikke kunne svare på.
//
// ⚠️ MÅLT MANGEL, IKKE EN IDÉ. Meta-analysen af 16.–22. september fandt otte
// Meta-henviste landinger helt uden kampagne, og ni med. Vi kunne se HVAD der
// manglede, men ikke HVORFOR: sagde de otte nej til marketing, eller var
// sporingen i stykker? Der fandtes nul samtykke-hændelser i hele basen. Hele
// diagnosen måtte skrives med det forbehold.
//
// ⚠️ DET HER ER DEN ENESTE HÆNDELSE DER MÅ SENDES UDEN SAMTYKKE, og det er
// fordi den er kvitteringen for selve samtykket. GDPR art. 7(1) kræver at vi
// kan påvise et samtykke; et "nej" der ikke registreres nogen steder, kan
// hverken påvises eller respekteres på tværs af enheder.
//
// ⚠️ DEN BÆRER INGEN IDENTIFIKATOR NÅR DER ER SAGT NEJ. Siger den besøgende ja
// til statistik, findes hendes anon_id allerede, og hændelsen bindes til hende
// — det er hende der har givet lov til netop dét. Siger hun nej, sendes der
// INTET id: hverken anon_id, IP-afledt mærke eller fingeraftryk. Serveren
// skriver da en ren optælling uden besøgende.
//
// ⚠️ `handling_id` ER IKKE ET SPOR AF EN PERSON. Den er et engangs-tilfældigt
// tal der kun findes i selve HTTP-kaldet, så en gentaget levering fra
// sendBeacon kan genkendes som den samme. Den gemmes ikke i browseren,
// genbruges ikke, og kan ikke slås op igen. Uden den ville to besøgende der
// afviser inden for samme ti sekunder blive talt som én.
//
// ⚠️ INTET SENDES TIL META HERFRA. Det her er Birdlys eget førsteparts-lag.
// Pixlen indlæses stadig kun af components/Maaling.js, og stadig kun med
// marketing-samtykke.
// ============================================================================

const SPOR_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/spor`
  : null;

/**
 * Registrér at den besøgende har taget stilling.
 *
 * @param {object|null} valg      Det gemte samtykkeobjekt, eller null ved nulstilling
 * @param {string}      handling  "valgt" | "nulstillet"
 *
 * ⚠️ MÅ ALDRIG KASTE OG ALDRIG BLOKERE. Banneret skal lukke i samme øjeblik
 * kunden trykker — en måling er aldrig vigtigere end at hun kommer videre.
 */
export function maalSamtykke(valg, handling = "valgt") {
  try {
    if (typeof window === "undefined" || !SPOR_URL) return;

    // ⚠️ KUN JA/NEJ, ALDRIG HVORNÅR-PÅ-SEKUNDET ELLER HVILKEN KNAP-VARIANT.
    // Tre booleans kan ikke udpege et menneske; en tidsstemplet klikprofil kan.
    const props = {
      marketing: !!valg?.marketing,
      statistik: !!valg?.statistik,
      tilstand: handling,
    };

    // ⚠️ ID'ET MEDSENDES KUN HVIS HUN HAR SAGT JA TIL STATISTIK — og det LÆSES,
    // det oprettes aldrig herfra. Et nej til statistik må ikke kunne føre til at
    // der bliver skabt et id at måle nejet med.
    const anon_id = props.statistik ? laesAnonId() : null;

    const krop = JSON.stringify({
      event: "consent_recorded",
      ...(anon_id ? { anon_id } : {}),
      // ⚠️ ENGANGSNØGLE, IKKE ET ID PÅ HENDE. Se noten øverst.
      handling_id: nonce(),
      path: window.location.pathname.slice(0, 200),
      props,
    });

    const blob = new Blob([krop], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon(SPOR_URL, blob)) return;
    fetch(SPOR_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: krop, keepalive: true })
      .catch(() => { /* en tabt måling er ikke en fejl kunden skal mærke */ });
  } catch { /* måling må aldrig vælte siden */ }
}

/**
 * Læser det eksisterende anonyme id — og opretter aldrig et nyt.
 *
 * ⚠️ HVORFOR IKKE `hentAnonId()` FRA lib/anonId.js. To grunde, og begge er
 * reelle. For det første ville importen lukke en cyklus: samtykke.js →
 * samtykkeMaaling.js → anonId.js → samtykke.js. For det andet OPRETTER
 * hentAnonId() et id hvis der ikke er et — og i det ene øjeblik hvor kunden
 * lige har trykket, må en måling af hendes valg ikke være det der giver hende
 * et id. Her læses kun, og formen tjekkes præcis som i anonId.js.
 */
function laesAnonId() {
  try {
    const gemt = window.localStorage.getItem("birdly_anon");
    return gemt && /^b[0-9a-f]{32}$/.test(gemt) ? gemt : null;
  } catch {
    return null;
  }
}

/** 16 tilfældige hex-tegn. Kun til deduplikering af ÉT kald. */
function nonce() {
  try {
    const a = new Uint8Array(8);
    crypto.getRandomValues(a);
    return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // ⚠️ FALDER VI TILBAGE PÅ Math.random, ER DET STADIG KUN EN DEDUP-NØGLE.
    // Den skal ikke være uforudsigelig, kun forskellig.
    return Math.random().toString(16).slice(2, 18);
  }
}
