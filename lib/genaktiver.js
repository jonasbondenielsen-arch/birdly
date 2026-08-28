// =====================================================================
// Klient-lag mod Edge Function `genaktiver`.
//
// ⚠️ INTET FORRETNINGSLOGIK HER. Prisen, planerne og om kunden har ret til en
// gratis proeve afgoeres server-side. Denne fil henter og viser - den regner ikke.
// Gaettede vi paa "uden proeve" i browseren, kunne en manipuleret klient koebe
// sig til gratis dage.
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const url = () => `${SUPABASE_URL}/functions/v1/genaktiver`;
const AUTH = () => ({
  apikey: ANON || "",
  Authorization: `Bearer ${ANON || ""}`,
  "Content-Type": "application/json",
});

export async function hentGenaktivering(token) {
  const r = await fetch(`${url()}?token=${encodeURIComponent(token)}`, { headers: AUTH(), cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { found: false, ...d };
  return d;
}

export async function anmodGenaktivering({ token, plan, samtykke }) {
  const r = await fetch(url(), {
    method: "POST",
    headers: AUTH(),
    body: JSON.stringify({ token, plan, samtykke }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Noget gik galt.");
  return d;
}
