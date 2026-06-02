import Link from "next/link";
import "../app/footer.css";

/* Delt footer for forside og /udbud-for-alle.
   Sociale links og firmaoplysninger er PLADSHOLDERE — udskiftes med rigtige
   værdier, når Jonas leverer dem. Opfind ALDRIG CVR/adresse/telefon. */
export default function Footer() {
  return (
    <footer className="birdly-footer">
      <div className="fbanner">
        <span className="l">
          <svg width="24" viewBox="0 0 28 28" fill="none"><path d="M4 16C8 10 11 10 14 14" stroke="#7FD0FF" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 14C17 10 20 10 24 16" stroke="#7FD0FF" strokeWidth="2.4" strokeLinecap="round" /></svg>
          Vi matcher. Du handler. Sammen skaber vi værdi for det offentlige.
        </span>
      </div>
      <div className="foot">
        <Link href="/" className="flogo">
          <svg width="28" height="24" viewBox="0 0 48 40" fill="none"><path d="M4 31 Q24 27 46 6 Q27 15 9 27 Z" fill="#7FD0FF" /><path d="M6 35 Q22 32 39 18 Q25 23 11 31 Z" fill="#2EB7FF" opacity=".85" /></svg>
          <span>Birdly<span className="dk">.dk</span></span>
        </Link>
        <div className="flinks">
          <a href="/#hvorfor">Hvorfor Birdly</a>
          <a href="/#hvordan">Hvordan virker det</a>
          <a href="/#priser">Priser</a>
          <a href="/#faq">FAQ</a>
          <a href="/#om">Om os</a>
          <Link href="/udbud-for-alle">Udbud er for alle</Link>
          <a href="/#opsigelse">Opsigelse</a>
        </div>
        <div className="fsocial">
          <a href="[FACEBOOK-URL]" aria-label="Birdly på Facebook"><svg width="18" viewBox="0 0 24 24"><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.3 1.4-1.3h1.4V5.6c-.7-.1-1.4-.1-2.1-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.5V14h2.3v7z" fill="#cdd8e6" /></svg></a>
          <a href="[INSTAGRAM-URL]" aria-label="Birdly på Instagram"><svg width="18" viewBox="0 0 24 24" fill="none" stroke="#cdd8e6" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="1" fill="#cdd8e6" stroke="none" /></svg></a>
          <a href="[GOOGLE-ANMELDELSER-URL]" aria-label="Birdly på Google anmeldelser"><svg width="18" viewBox="0 0 24 24" fill="none" stroke="#cdd8e6" strokeWidth="1.9"><path d="M20 12a8 8 0 10-2.4 5.7" strokeLinecap="round" /><path d="M20.5 12H13" strokeLinecap="round" /></svg></a>
          <a href="[TRUSTPILOT-URL]" aria-label="Birdly på Trustpilot"><svg width="18" viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" fill="#cdd8e6" /></svg></a>
        </div>
        <div className="fcompany">
          <b>Birdly [ApS]</b> · CVR [8-cifret CVR] · [Vejnavn nr., postnr. by] · <a href="mailto:hello@birdly.dk">hello@birdly.dk</a> · [+45 00 00 00 00]<br />
          <Link href="/handelsbetingelser">Handelsbetingelser</Link> · <Link href="/privatlivspolitik">Privatlivspolitik</Link>
        </div>
        <div className="fcred">Udbudsdata fra udbud.dk og EU/TED. © Birdly. Mere relevans. Mindre bøvl. Ingen spam.</div>
      </div>
    </footer>
  );
}
