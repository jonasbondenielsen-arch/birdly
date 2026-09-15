import { redirect } from "next/navigation";
import { Logo } from "../../../components/Logo";

// Kort-link-redirect (Fase D — SMS). /u/{kode} → resolver via Edge Function til det
// fulde token og redirecter. noindex. Ingen login.
//
// TO SLAGS KODER (Spor 3a/3b) — resolve-short-code fortæller hvilken slags det er:
//   kind:"notice" → /udbud/{token}         (ét udbud — uændret adfærd)
//   kind:"list"   → /mine-opgaver/{token}  (kundens samleside med ALLE aktive opgaver)
// Mangler `kind` (ældre svar), antages "notice", så gamle links opfører sig som før.
export const metadata = {
  title: "Birdly",
  robots: { index: false, follow: false },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function Page({ params }) {
  const { code } = await params;
  let token = null;
  let kind = "notice";
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/resolve-short-code?code=${encodeURIComponent(code)}`, {
      headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` },
      cache: "no-store",
    });
    const b = await res.json().catch(() => ({}));
    if (res.ok && b.found && b.token) { token = b.token; kind = b.kind || "notice"; }
  } catch { /* falder igennem til ugyldig-tilstand */ }

  // kaster NEXT_REDIRECT — skal stå uden for try/catch
  if (token) redirect(kind === "list" ? `/mine-opgaver/${token}` : `/udbud/${token}`);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 18px", textAlign: "center", fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 24px" }}><Logo /></div>
      <h1 style={{ fontSize: 22, color: "#1B2733" }}>Linket er ugyldigt eller udløbet</h1>
      <p style={{ color: "#6B7785", lineHeight: 1.6 }}>Tjek at du har kopieret hele linket fra din besked.</p>
    </main>
  );
}
