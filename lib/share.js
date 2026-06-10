// =====================================================================
// Deleside-opslag (Fase D) mod Edge Function get-shared-notice.
//
// get-shared-notice er offentlig (verify_jwt=false) med service-role internt —
// birdly har KUN anon-nøglen. Token'en resolver til ÉN match (udbud + kunde).
// Kaldes server-side fra delesiden (ingen login).
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returnerer { found, notice, customer, why, expires_at } eller { found:false }.
// Kaster ALDRIG — delesiden viser en pæn "ugyldigt link"-tilstand på found:false.
export async function fetchSharedNotice(token) {
  if (!token || !SUPABASE_URL) return { found: false };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-shared-notice?token=${encodeURIComponent(token)}`,
      { headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` }, cache: "no-store" }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.found) return { found: false, expired: !!body.expired };
    return body;
  } catch {
    return { found: false };
  }
}
