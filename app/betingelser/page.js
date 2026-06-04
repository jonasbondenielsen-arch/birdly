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
const ICONS = {
  // Handelsbetingelser → fjerpen (quill)
  feather: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
      <path d="M16 8L2 22" />
      <path d="M17.5 15H9" />
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
  // Sikkerhed og drift → vejkegle
  cone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l5 16H7z" />
      <path d="M5 19h14" />
      <path d="M9.3 11h5.4M8.3 15h7.4" />
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
            <div className="ic">{ICONS.feather}</div>
            <h3>Handelsbetingelser</h3>
            <p>Vilkår for abonnement, prøveperiode, betaling og opsigelse.</p>
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
            <div className="ic">{ICONS.cone}</div>
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
