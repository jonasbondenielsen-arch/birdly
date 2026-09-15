import { redirect } from "next/navigation";
import { Logo } from "../../../components/Logo";

// Kort-link til det KORTE feedback-skema: /fb/{list_short_code} → /feedback/{list_token}
//
// Samme mønster som /f/[code] og /u/[code] — kun destinationen er en anden. Grunden er
// den samme: det fulde list_token er 48 hex-tegn og ville koste et helt ekstra segment
// i hver SMS. Kortkoden er 8 tegn.
//
// Genbruger resolve-short-code's EKSISTERENDE kind:"list"-opslag — ingen ny tabel,
// ingen ny kolonne, ingen ændring i Edge Function'en.
export const metadata = {
  title: "Birdly",
  robots: { index: false, follow: false },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function Page({ params }) {
  const { code } = await params;
  let token = null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/resolve-short-code?code=${encodeURIComponent(code)}`, {
      headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` },
      cache: "no-store",
    });
    const b = await res.json().catch(() => ({}));
    // KUN list-koder. En udbuds-kode peger på ét udbud og har intet at gøre med
    // kundens prøveperiode — den må ikke kunne åbne skemaet.
    if (res.ok && b.found && b.token && b.kind === "list") token = b.token;
  } catch { /* falder igennem til ugyldig-tilstand */ }

  // kaster NEXT_REDIRECT — skal stå uden for try/catch
  if (token) redirect(`/feedback/${token}`);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 18px", textAlign: "center", fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 24px" }}><Logo /></div>
      <h1 style={{ fontSize: 22, color: "#1B2733" }}>Linket gælder ikke længere</h1>
      <p style={{ color: "#6B7785", lineHeight: 1.6 }}>Tjek at du har kopieret hele linket fra din besked.</p>
    </main>
  );
}
