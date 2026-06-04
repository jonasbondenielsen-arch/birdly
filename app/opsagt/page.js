import Link from "next/link";
import { Logo } from "../../components/Logo";
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
          <Logo height={32} />
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
