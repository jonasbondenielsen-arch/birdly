import Link from "next/link";
import "../app/legal.css";

export default function LegalPlaceholder({ title }) {
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
          <span className="ey">🐦 Birdly</span>
          <h1>{title}</h1>
          <p>Indhold på vej. Vi er ved at lægge sidste hånd på {title.toLowerCase()} — det er klar her meget snart.</p>
          <Link href="/" className="home">Tilbage til forsiden</Link>
        </div>
      </main>
    </div>
  );
}
