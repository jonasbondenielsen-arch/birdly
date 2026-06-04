import Link from "next/link";
import { Logo } from "./Logo";
import "../app/legal.css";

export default function LegalPlaceholder({ title }) {
  return (
    <div className="birdly-legal">
      <header>
        <div className="bar">
          <Logo height={30} />
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
