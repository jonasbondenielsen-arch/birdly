// ============================================================================
// FEJLRAPPORTERING — ét sted der sender en fejl videre til alarmeringen.
//
// ⚠️ DEN MAA ALDRIG KASTE. Alt her kører i en situation hvor noget allerede er
// gået galt. En fejl i fejlhåndteringen forvandler en brudt komponent til en
// brudt side — præcis den forstørrelse vi prøver at undgå.
//
// ⚠️ DEN MAA ALDRIG BLOKERE. Ingen await på svaret fra kaldstedet: kunden skal
// se sin fallback nu, ikke når loggen har svaret.
//
// ⚠️ INGEN PII SENDES. Kun rute og fejlbesked. Aldrig body, cookies, query
// eller noget fra kundens data. Fejlbeskeden kan i sig selv indeholde et id;
// edge-funktionen renser den, før den hashes og gemmes.
// ============================================================================

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * @param {Error|unknown} fejl
 * @param {{rute?: string, kilde?: "server"|"klient"}} [ctx]
 */
export function rapporterFejl(fejl, { rute = null, kilde = "klient" } = {}) {
  try {
    if (!URL_BASE || !ANON) return;
    const besked = String(fejl?.message || fejl || "").slice(0, 500);
    if (!besked) return;

    // ⚠️ keepalive: en fejl under sideskift ville ellers faa sin request
    // annulleret, netop naar den er mest interessant.
    fetch(`${URL_BASE}/functions/v1/log-fejl`, {
      method: "POST",
      keepalive: true,
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        rute,
        kilde,
        besked,
        stak: String(fejl?.stack || "").slice(0, 4000) || null,
      }),
    }).catch(() => {});
  } catch {
    /* se noten oeverst: aldrig kaste herfra */
  }
}
