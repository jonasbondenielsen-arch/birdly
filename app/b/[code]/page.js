import Link from "next/link";
import { Logo } from "../../../components/Logo";

// /b/{list_short_code} — betalingslink for KORTLØSE kunder (05-08-2026).
//
// ⚠️ SPÆRRET 13-08-2026. Siden åbnede Frisbiis checkout via
// create-subscription-session, som kører på FRISBII_TEST_PRIVATE_KEY — altså
// test-miljøet, fordi indløseraftalen hos Clearhaus endnu ikke er godkendt.
//
// For en RIGTIG kunde havde det to udfald, og begge var uacceptable:
//   1. Kortet afvises af test-gatewayen → kunden tror Birdly er i stykker.
//   2. Værre: checkout gennemføres som testbetaling → frisbii-webhookens
//      invoice_settled flipper hende til status='aktiv'. Hun tror hun betaler, admin
//      viser hende som betalende, hun tælles med i MRR — og der er aldrig flyttet en
//      krone. Det forurener præcis de tal en køber due-diligencer.
//
// Betaling håndteres derfor 100 % MANUELT indtil videre: Jonas kontakter kunden og
// sender faktura eller betalingslink selv. Ingen kortløs besked indeholder længere
// et link hertil (se lib/notify/kortloesTemplates.js i birdly-admin), men adressen
// kan stadig ligge i en gammel mail — derfor spærres selve ruten, ikke kun linket.
//
// ⚠️ SÅDAN ÅBNES DEN IGEN, når Clearhaus er godkendt OG live-nøglerne er sat:
// gendan `import KortloesBetal` og `return <KortloesBetal code={code} />`. Komponenten
// og Edge Function'en er urørte og virker. Skift ALDRIG kun denne side tilbage uden
// samtidig at flytte create-subscription-session fra test- til live-nøgle.
//
// ⚠️ NOINDEX bevaret. Adressen er en kundes personlige link, præcis som
// /mine-opgaver/ og /udbud/.
export const metadata = {
  title: "Betaling åbner snart | Birdly",
  robots: { index: false, follow: false },
};

const NAVY = "#1B2733";
const MUTED = "#6B7785";
const TEAL = "#1E9E8A";

export default async function Page({ params }) {
  // Koden læses, men bruges bevidst ikke til et opslag: siden må ikke røbe om et
  // link er gyldigt, og der er alligevel intet at gøre med svaret.
  await params;

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "24px 18px 64px", fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 22px" }}>
        <Link href="/" aria-label="Birdly forside"><Logo /></Link>
      </div>
      <div style={{ background: "#fff", border: "1px solid #E6EAEF", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <h1 style={{ fontSize: 23, lineHeight: 1.3, margin: "0 0 12px", color: NAVY }}>
          Betaling åbner snart
        </h1>
        <p style={{ margin: "0 0 14px", color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Vi er ved at lægge sidste hånd på vores betalingsløsning, så du kan ikke
          tilmelde betaling her endnu.
        </p>
        <p style={{ margin: "0 0 14px", color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Du skal ikke gøre noget. Vil du gerne fortsætte med Birdly, tager vi
          personligt fat i dig med det praktiske.
        </p>
        <p style={{ margin: "0 0 20px", color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Har du spørgsmål, er du altid velkommen til at skrive til os på{" "}
          <a href="mailto:support@birdly.dk" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>support@birdly.dk</a>.
          Vi svarer hurtigt.
        </p>
        <Link href="/" style={{ display: "inline-block", background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          Til birdly.dk
        </Link>
      </div>
    </main>
  );
}
