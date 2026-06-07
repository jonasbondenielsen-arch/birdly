import Link from "next/link";
import { BirdMark } from "./Logo";
import "../app/footer.css";

/* Delt footer — ren, rolig opstilling: link-kolonner øverst, og et bundbånd med
   logo til venstre, firmaoplysninger centreret og sociale ikoner til højre.
   Sociale URL'er er PLADSHOLDERE indtil Jonas leverer dem. Firmaoplysninger:
   enkeltmandsvirksomhed (ingen "ApS", intet registreringsnummer). */
export default function Footer() {
  return (
    <footer className="birdly-footer">
      <div className="finner">
        <div className="fcols">
          <div className="fcol">
            <b>Birdly</b>
            <a href="/#hvorfor">Hvorfor Birdly</a>
            <a href="/#hvordan">Hvordan virker det</a>
            <a href="/#priser">Priser</a>
            <a href="/#faq">FAQ</a>
            <a href="/#om">Om os</a>
            <Link href="/brancher">For dit fag</Link>
            <Link href="/udbud-for-alle">Udbud er for alle</Link>
            <a href="/#opsigelse">Opsigelse</a>
          </div>
          <div className="fcol">
            <b>Juridisk</b>
            <Link href="/betingelser">Betingelser &amp; sikkerhed</Link>
          </div>
        </div>

        <div className="fbottom">
          <Link href="/" className="fmark" aria-label="Birdly forside">
            <BirdMark size={30} />
            <span>Birdly<span className="dk">.dk</span></span>
          </Link>

          <div className="fcompany">
            Birdly.dk · CVR 35764283 · Fjordvej 4, 4300 Holbæk<br />
            <a href="mailto:hello@birdly.dk">hello@birdly.dk</a>
          </div>

          <div className="fsocial">
            <a href="[FACEBOOK-URL]" aria-label="Birdly på Facebook">
              <svg width="17" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.3 1.4-1.3h1.4V5.6c-.7-.1-1.4-.1-2.1-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.5V14h2.3v7z" /></svg>
            </a>
            <a href="[INSTAGRAM-URL]" aria-label="Birdly på Instagram">
              <svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="[GOOGLE-ANMELDELSER-URL]" aria-label="Birdly på Google anmeldelser">
              <svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 12a8 8 0 10-2.4 5.7" strokeLinecap="round" /><path d="M20.5 12H13" strokeLinecap="round" /></svg>
            </a>
            <a href="[TRUSTPILOT-URL]" aria-label="Birdly på Trustpilot">
              <svg width="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
