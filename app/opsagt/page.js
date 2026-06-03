import Link from "next/link";
import "../legal.css";

export const metadata = {
  title: "Opsigelse — Birdly",
  robots: { index: false, follow: false }, // bekræftelses-landingsside, ikke til indeksering
};

// Landingsside efter klik på bekræftelseslinket (confirm-cancellation redirecter hertil).
// ?status=expired | invalid | error -> vis fejl. Ingen status -> opsigelse bekræftet.
export default async function OpsagtPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const status = sp.status;
  const failed = status === "expired" || status === "invalid" || status === "error";

  return (
    <div className="birdly-legal">
      <header>
        <div className="bar">
          <Link href="/" className="logo">
            <svg width="30" height="26" viewBox="0 0 48 40" fill="none"><defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#0D1B2A" /><stop offset=".45" stopColor="#2EB7FF" /><stop offset="1" stopColor="#9BDCFF" /></linearGradient></defs><path d="M4 31 Q24 27 46 6 Q27 15 9 27 Z" fill="url(#wg)" /><path d="M6 35 Q22 32 39 18 Q25 23 11 31 Z" fill="url(#wg)" opacity=".8" /></svg>
            <span>Birdly<span className="dk">.dk</span></span>
          </Link>
          <Link href="/" className="back">← Tilbage til forsiden</Link>
        </div>
      </header>

      <main className="legal-main">
        <div className="legal-card">
          {failed ? (
            <>
              <span className="ey">🐦 Birdly</span>
              <h1>{status === "expired" ? "Linket er udløbet" : "Linket virker ikke"}</h1>
              <p>
                {status === "expired"
                  ? "Dit bekræftelseslink er udløbet. Start opsigelsen forfra nederst på forsiden, så sender vi et nyt link."
                  : "Vi kunne ikke bekræfte din opsigelse med det link. Prøv at starte forfra nederst på forsiden, eller skriv til support@birdly.dk, så hjælper vi dig."}
              </p>
              <Link href="/#opsigelse" className="home">Til opsigelse</Link>
            </>
          ) : (
            <>
              <span className="ey">🐦 Birdly</span>
              <h1>Din opsigelse er bekræftet</h1>
              <p>
                Tak — vi har registreret din opsigelse. Du er aktiv din nuværende periode ud og hører fra
                os på mail med de sidste detaljer. Du er altid velkommen tilbage på pinden. 🐦
              </p>
              <Link href="/" className="home">Tilbage til forsiden</Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
