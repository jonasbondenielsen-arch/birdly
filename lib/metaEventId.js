"use client";

// ============================================================================
// META EVENT ID — så browseren og serveren kan fortælle om SAMME hændelse
// uden at tale sammen.
//
// ⚠️ PROBLEMET DEN LØSER. Meta deduplikerer på (event_name, event_id). Uden et
// event_id vil et browser-event og et server-event for den samme konvertering
// blive talt som TO konverteringer — og algoritmen lærer at trafikken
// konverterer dobbelt så godt som den gør. Det er præcis den fejl huset altid
// har passet på ved at holde antallet af Meta-hændelser nede; her er værnet
// flyttet fra "send færre" til "sig hvilken hændelse det er".
//
// ⚠️ DERFOR SKAL ID'ET VÆRE UDREGNET, IKKE UDDELT. Browseren og serveren kan
// ikke koordinere: serveren fyrer fra en databasetrigger timer efter at fanen
// er lukket. Et tilfældigt id ville kræve at den ene fortalte den anden hvad
// det blev — altså en kanal der ikke findes. Et UDREGNET id kræver kun at
// begge kender de samme to ting: hvad skete der, og for hvem.
//
// ⚠️ INGEN PII UD AF HUSET. Abonnent-uuid'en er vores eget interne,
// tilfældige id — men den er stadig en identifikator, og den skal ikke ligge
// læsbar hos en tredjepart. Derfor hashes den sammen med en husnøgle og
// hændelsesnavnet. Meta får et ugennemsigtigt, stabilt mærke.
//
// ⚠️ NAVNET SKAL MED I HASHEN. Uden det ville Lead og StartTrial for samme
// kunde få samme id, og Meta ville deduplikere to FORSKELLIGE konverteringer
// ned til én. Det er den modsatte fejl, og den er lige så dyr.
//
// ⚠️ SAMME ALGORITME I birdly-admin/lib/marketing/metaEventId.js.
// DUPLIKERET MED VILJE — de to repoer deler ingen kode. ÆNDRER DU DEN ENE,
// SKAL DU ÆNDRE DEN ANDEN, ellers holder deduplikeringen op med at virke, og
// det viser sig først som en langsomt stigende konverteringsrate hos Meta.
// ============================================================================

// Husets forstavelse. Ikke en hemmelighed — den skal stå ens begge steder og
// må derfor ikke ligge i env, hvor de to repoer kunne komme ud af trit.
const PRAEFIKS = "birdly:meta:v1";

/** Hex-strengen af en SHA-256. Tom streng ⇒ null, aldrig et kast. */
async function sha256Hex(tekst) {
  try {
    if (typeof crypto === "undefined" || !crypto.subtle) return null;
    const data = new TextEncoder().encode(tekst);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

/**
 * Det deterministiske event_id for én logisk konvertering.
 *
 * @param {string} metaEvent     "Lead" | "StartTrial" | "AddPaymentInfo"
 * @param {string} subscriberId  Birdlys egen abonnent-uuid
 * @returns {Promise<string|null>} 32 hex-tegn, eller null hvis vi ikke kan regne det ud
 *
 * ⚠️ 32 TEGN, IKKE 64. Meta tillader op til 64, men halvdelen af en SHA-256 er
 * rigeligt til at to af vores hændelser aldrig kolliderer, og et kortere mærke
 * er nemmere at genkende i en log.
 *
 * ⚠️ RETURNERER null FREM FOR AT KASTE. Findes crypto.subtle ikke (gammel
 * browser, usikker kontekst), sender vi hellere hændelsen UDEN event_id end
 * slet ikke. Uden id går deduplikeringen tabt for netop den hændelse — men
 * kunden mærker ingenting, og det er den rigtige rækkefølge af hensyn.
 */
export async function metaEventId(metaEvent, subscriberId) {
  if (!metaEvent || !subscriberId) return null;
  const hex = await sha256Hex(`${PRAEFIKS}:${metaEvent}:${subscriberId}`);
  return hex ? hex.slice(0, 32) : null;
}
