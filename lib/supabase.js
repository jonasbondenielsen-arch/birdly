// =====================================================================
// Letvægts Supabase REST-klient til den OFFENTLIGE side.
//
// Bruger KUN den offentlige anon-nøgle (NEXT_PUBLIC_*). Via RLS må anon
// kun INSERTE i `subscribers` (tilmelding) og `support_messages` (chat) —
// ingen SELECT/UPDATE/DELETE.
//
// VIGTIGT: alle inserts kører med `Prefer: return=minimal`. Anon har ingen
// SELECT-ret, så rækken må ALDRIG læses tilbage — gør den det (fx
// `return=representation` / supabase-js `.select()`), fejler kaldet med en
// RLS-fejl. return=minimal giver 201 uden body, hvilket er præcis det vi vil.
//
// Nøgler sættes som env vars i Vercel (det offentlige projekt) — aldrig
// committet. Lokalt: .env.local (gitignored). Se .env.example.
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Insert én række via PostgREST med anon-nøglen og return=minimal.
 * Kaster ved manglende env eller ved ikke-2xx-svar (fx RLS-afvisning).
 * @param {string} table  fx "subscribers" | "support_messages"
 * @param {object} row    rækken der skal indsættes
 */
export async function insertRow(table, row) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase er ikke konfigureret (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY mangler)."
    );
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal", // ingen readback — anon må ikke SELECT'e
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message || body?.hint || "";
    } catch {
      // intet JSON-body (fx return=minimal-fejl) — brug bare status
    }
    throw new Error(
      `Supabase-insert i "${table}" fejlede (${res.status}). ${detail}`.trim()
    );
  }
}
