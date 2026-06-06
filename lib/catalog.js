// =====================================================================
// Offentlige onboarding-kald mod Supabase Edge Functions.
//
// get-catalog + signup er offentlige Edge Functions (verify_jwt=false) med
// service-role internt — birdly-siden har KUN anon-nøglen. Vi sender anon-nøglen
// som apikey, og NEXT_PUBLIC_SUPABASE_URL peger på projektet.
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function fnUrl(name) {
  if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL mangler.");
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

// Hent fag-kataloget (fag + smal/bred + branchekode-map + regioner).
export async function fetchCatalog() {
  const res = await fetch(fnUrl("get-catalog"), {
    headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` },
  });
  if (!res.ok) throw new Error("Kunne ikke hente kataloget (" + res.status + ").");
  return res.json();
}

// Send tilmeldingen til signup-funktionen (gemmer atomisk). Returnerer {ok, id}.
export async function submitSignup(payload) {
  const res = await fetch(fnUrl("signup"), {
    method: "POST",
    headers: {
      apikey: ANON || "",
      Authorization: `Bearer ${ANON || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Tilmeldingen kunne ikke gemmes (" + res.status + ").");
  return body;
}
