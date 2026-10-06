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
// ⚠️ DEN BÆRER INGEN IDENTIFIKATOR NÅR DER ER SAGT NEJ. Siger hun nej, sendes
// der INTET id: hverken anon_id, IP-afledt mærke eller fingeraftryk. Serveren
// skriver da en ren optælling uden besøgende.
//
// ⚠️ SIGER HUN JA, SKABES ID'ET HER HVIS DET IKKE FINDES (rettet 06-10-2026).
// Noten her sagde før at id'et "findes allerede" ved et ja. Det gjorde det
// ikke: ved det FØRSTE ja oprettes det først bagefter, af Maaling.js. Derfor
// gik 215 af 224 samtykke-hændelser ud uden id og kunne aldrig knyttes til
// kunden — se den lange note ved kaldet. Et ja til statistik ER tilladelsen
// til at have et førsteparts-id, så det er lovligt at skabe det i samme
// øjeblik; et nej skaber stadig intet.
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

import { hentAnonId } from "./anonId";

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

    // ⚠️ ID'ET MEDSENDES KUN HVIS HUN HAR SAGT JA TIL STATISTIK. Et nej må
    // ALDRIG kunne føre til at der bliver skabt et id at måle nejet med — det
    // er stadig reglen, og den står nu to steder: i grenen her, OG inde i
    // hentAnonId(), som selv spørger `maa("statistik")` og returnerer null.
    //
    // ⚠️ DEN SKABER NU, HVOR DEN FØR KUN LÆSTE (06-10-2026) — OG DET VAR EN
    // MÅLT P0. `laesAnonId()` læste localStorage og oprettede aldrig. Men
    // id'et oprettes først BAGEFTER, af Maaling.js når den hører
    // `birdly-samtykke`. I det ene øjeblik banneret besvares FØRSTE gang,
    // findes `birdly_anon` endnu ikke — så samtykke-hændelsen gik ud uden id.
    // Målt: 215 af 224 consent_recorded uden visitor_id, og NUL på en ægte
    // besøgende. Konsekvensen var ikke kosmetisk: birdly_marketing_samtykke()
    // joiner event → visitors → subscriber, så den var false for alle 66
    // kunder, Meta-køen var altid tom, og CAPI havde sendt 0 konverteringer
    // siden den blev bygget.
    //
    // ⚠️ RÆKKEFØLGEN GØR DET LOVLIGT. gemSamtykke() skriver valget til
    // localStorage (samtykke.js:83) FØR den kalder herind (:95). `maa(...)`
    // inde i hentAnonId() læser derfor det NYE valg — id'et skabes kun i kraft
    // af det ja hun lige har givet, aldrig før det.
    //
    // ⚠️ CYKLUSSEN ER REEL, MEN DØD. samtykkeMaaling → anonId → samtykke →
    // samtykkeMaaling. Ingen af de tre moduler kalder noget på topniveau, og
    // maalSamtykke kører først fra en klik-handler længe efter evalueringen.
    // Vagten importerer hele grafen og KALDER funktionen for at bevise det,
    // frem for at antage det.
    const anon_id = props.statistik ? hentAnonId() : null;

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

// ⚠️ `laesAnonId()` ER FJERNET (06-10-2026), IKKE BARE FORBIGÅET. Den lå her
// med en note om at hentAnonId() "opretter et id hvis der ikke er et" — og
// netop dét viste sig at være grunden til at Meta-laget aldrig virkede. Lod vi
// den blive stående ubrugt, ville næste udvikler læse noten som husets regel
// og skifte tilbage. Begrundelsen for at læse-kun var reel på det tidspunkt;
// den holdt bare ikke mod det målte resultat.

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
