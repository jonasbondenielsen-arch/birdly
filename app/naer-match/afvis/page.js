import Link from "next/link";
import { Logo } from "../../../components/Logo";
import "../../forside.css";

// Landingsside for "Ikke interessant — for høj værdi" fra velkomstmailen.
//
// Server-renderet: klikket udfører handlingen med det samme og viser resultatet.
// Ingen klient-JavaScript, ingen bekræftelses-knap — kunden har allerede taget sin
// beslutning ved at klikke i mailen, og et ekstra "er du sikker?" ville være en
// forhindring uden formål.
//
// NOINDEX: siden er et engangs-svar på et signeret link og hører ikke i søgeresultater.
export const metadata = { robots: { index: false, follow: false } };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function afvis(shareToken, sig) {
  if (!SUPABASE_URL || !ANON || !shareToken || !sig) return { ok: false };
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/afvis-naer-match`, {
      method: "POST",
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify({ share_token: shareToken, sig }),
      cache: "no-store",
    });
    return await res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const r = await afvis(String(sp.t || ""), String(sp.s || ""));

  return (
    <div className="birdly-home">
      <header>
        <div className="wrap bar">
          <Logo height={32} />
          <div className="right">
            <Link href="/" className="nav-cta">Til birdly.dk</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap center" style={{ maxWidth: 640, position: "relative", zIndex: 2 }}>
          {r.ok ? (
            <>
              <h1 style={{ fontSize: 30 }}>Tak — det er noteret</h1>
              <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
                {r.titel ? <>Vi foreslår ikke <b>{r.titel}</b> igen.</> : "Forslaget er fjernet."}{" "}
                Du får fortsat besked, når der er en opgave der passer til dine kriterier —
                og vi holder os til dit beløbsloft.
              </p>
              <p className="sub" style={{ marginLeft: "auto", marginRight: "auto", fontSize: 15 }}>
                Vil du hellere se større opgaver, kan du ændre dit beløbsloft på din opgaveliste.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 30 }}>Linket virker ikke længere</h1>
              {/* Bevidst samme svar uanset om signaturen var forkert eller forslaget
                  ukendt — vi røber ikke om et token findes. */}
              <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
                Måske er forslaget allerede fjernet, eller linket er blevet forkortet
                undervejs. Du kan altid se og sortere i dine opgaver via linket i den
                seneste besked fra os.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
