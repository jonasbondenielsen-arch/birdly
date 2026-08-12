import Link from "next/link";
import Footer from "../../components/Footer";
import { Logo, BirdMark } from "../../components/Logo";
import "../betingelser.css";

export const metadata = {
  title: "Betingelser & sikkerhed — Birdly",
  description: "Birdlys vilkår og sikkerhed: handelsbetingelser, vilkår for brug, privatlivspolitik, cookiepolitik, sikkerhed og drift samt underdatabehandlere.",
};

// Card icons in the site's own outline style (inline SVG, stroke-width 2,
// currentColor). Motifs match Dinero's themes, drawn in OUR style/brand colors.
// Rene, ensartede ikoner: viewBox 24, stroke-width 2, runde hjørner. Vilkår-kortet
// bruger fugle-mærket (<BirdMark>) i stedet for et af disse.
const ICONS = {
  // Handelsbetingelser → dokument/aftale m. flueben
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 14l2.2 2.2L15 12" />
    </svg>
  ),
  // Abonnementsbetingelser → betalingskort m. abonnements-cirkel.
  // Samme sprog som de øvrige: viewBox 24, stroke-width 2, runde hjørner.
  kort: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 14.5h3" />
    </svg>
  ),
  // Privatlivspolitik → skjold m. flueben
  shieldCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  // Cookiepolitik → cookie
  cookie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
    </svg>
  ),
  // Sikkerhed og drift → hængelås m. nøglehul
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 018 0v3.5" />
      <path d="M12 14v2.5" />
    </svg>
  ),
  // Underdatabehandlere → server/database
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  ),
};

export default function BetingelserPage() {
  return (
    <div className="birdly-betingelser">
      <header>
        <div className="bar">
          <Logo height={32} />
          <Link href="/" className="back">← Tilbage til forsiden</Link>
        </div>
      </header>

      <div className="hero">
        <h1>Her finder du vores betingelser &amp; sikkerhed</h1>
        <p>Når du bruger Birdly, passer vi på dine data. Her kan du læse vores vilkår, og hvordan vi håndterer oplysninger.</p>
      </div>

      <div className="wrap">
        <div className="section-title">Dokumenter</div>
        <div className="cards">

          <Link href="/handelsbetingelser" className="card featured">
            <div className="ic">{ICONS.doc}</div>
            <h3>Handelsbetingelser</h3>
            <p>Aftalen mellem dig og Birdly: hvad tjenesten er, betalingsmetoder og ansvar.</p>
            <span className="btn">Klik her</span>
          </Link>

          {/* Abonnementsvilkårene har sin egen side, adskilt fra handelsbetingelserne,
              så det er tydeligt hvad der er hvad. Samme kort-stil som de øvrige. */}
          <Link href="/abonnementsbetingelser" className="card featured">
            <div className="ic">{ICONS.kort}</div>
            <h3>Abonnementsbetingelser</h3>
            <p>Pris, prøveperiode, fornyelse, betalingskort og opsigelse.</p>
            <span className="btn">Klik her</span>
          </Link>

          <Link href="/vilkaar-for-brug" className="card">
            <div className="ic ic-bird"><BirdMark size={48} /></div>
            <h3>Vilkår for brug af birdly.dk</h3>
            <p>Reglerne for at bruge hjemmesiden og tjenesten.</p>
            <span className="btn">Klik her</span>
          </Link>

          <Link href="/privatlivspolitik" className="card">
            <div className="ic">{ICONS.shieldCheck}</div>
            <h3>Privatlivspolitik</h3>
            <p>Hvilke personoplysninger vi behandler, hvorfor — og dine rettigheder.</p>
            <span className="btn">Klik her</span>
          </Link>

          <Link href="/cookiepolitik" className="card">
            <div className="ic">{ICONS.cookie}</div>
            <h3>Cookiepolitik</h3>
            <p>Hvilke cookies vi bruger, og hvordan du styrer dit samtykke.</p>
            <span className="btn">Klik her</span>
          </Link>

          <Link href="/sikkerhed-og-drift" className="card">
            <div className="ic">{ICONS.lock}</div>
            <h3>Sikkerhed og drift</h3>
            <p>Hvordan vi beskytter data: EU-hosting, kryptering og adgangsstyring.</p>
            <span className="btn">Klik her</span>
          </Link>

          <Link href="/underdatabehandlere" className="card">
            <div className="ic">{ICONS.database}</div>
            <h3>Underdatabehandlere</h3>
            <p>Liste over de leverandører, der behandler data på vores vegne.</p>
            <span className="btn">Klik her</span>
          </Link>

        </div>
      </div>

      <Footer />
    </div>
  );
}
