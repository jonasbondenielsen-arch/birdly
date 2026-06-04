import Link from "next/link";
import Footer from "../../components/Footer";
import "../betingelser.css";

export const metadata = {
  title: "Betingelser & sikkerhed — Birdly",
  description: "Birdlys vilkår og sikkerhed: handelsbetingelser, privatlivspolitik og cookiepolitik.",
};

// Card icons in the site's own outline style (inline SVG, stroke-width 2,
// currentColor). Motifs per brief: dokument, skjold, cookie, hængelås, noder.
const ICONS = {
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 3h6v3H9zM8 12h8M8 16h6" />
    </svg>
  ),
  shieldCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  cookie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  ),
  nodes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="12" cy="18" r="2.3" />
      <path d="M8 6h8M7.4 7.8l3.4 8.4M16.6 7.8l-3.4 8.4" />
    </svg>
  ),
};

export default function BetingelserPage() {
  return (
    <div className="birdly-betingelser">
      <header>
        <div className="bar">
          <Link href="/" className="logo">
            <svg width="30" height="26" viewBox="0 0 48 40" fill="none"><defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#0D1B2A" /><stop offset=".45" stopColor="#2EB7FF" /><stop offset="1" stopColor="#9BDCFF" /></linearGradient></defs><path d="M4 31 Q24 27 46 6 Q27 15 9 27 Z" fill="url(#wg)" /><path d="M6 35 Q22 32 39 18 Q25 23 11 31 Z" fill="url(#wg)" opacity=".8" /></svg>
            <span>Birdly<span className="dk">.dk</span></span>
          </Link>
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
            <p>Vilkår for abonnement, prøveperiode, betaling og opsigelse.</p>
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

          <div className="card soon">
            <div className="ic">{ICONS.lock}</div>
            <span className="badge-soon">KOMMER SENERE</span>
            <h3>Sikkerhed og drift</h3>
            <p>Hvordan vi beskytter data: EU-hosting, kryptering og adgangsstyring.</p>
            <span className="btn">Klik her</span>
          </div>

          <div className="card soon">
            <div className="ic">{ICONS.nodes}</div>
            <span className="badge-soon">KOMMER SENERE</span>
            <h3>Underdatabehandlere</h3>
            <p>Liste over de leverandører, der behandler data på vores vegne.</p>
            <span className="btn">Klik her</span>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
