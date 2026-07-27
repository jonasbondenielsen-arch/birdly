import Link from "next/link";
import Footer from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { BRANCHER } from "../../lib/branche";
import "../forside.css";

// Samleside over alle brancher (én diskret indgang fra footeren). Server-renderet,
// genbruger forsidens design (.birdly-home + forside.css). Hvert kort linker til
// fagets egen branchesides (/fag/[slug]).

export const metadata = {
  title: "Brancher — offentlige opgaver for dit fag | Birdly",
  description:
    "Vælg din branche og se, hvordan Birdly finder de offentlige opgaver, der passer til dit fag og dit område. Gratis i 14 dage.",
  alternates: { canonical: "/brancher" },
  openGraph: {
    title: "Brancher — offentlige opgaver for dit fag | Birdly",
    description: "Vælg din branche og se, hvordan Birdly finder de offentlige opgaver, der passer til dit fag.",
    type: "website",
    locale: "da_DK",
    siteName: "Birdly",
    url: "https://birdly.dk/brancher",
  },
};

export default function BrancherPage() {
  return (
    <div className="birdly-home">
      <header>
        <div className="wrap bar">
          <Logo height={32} />
          <nav className="menu">
            <a href="/#hvorfor">Hvorfor Birdly</a>
            <a href="/#hvordan">Hvordan virker det</a>
            <a href="/#priser">Priser</a>
            <a href="/#faq">FAQ</a>
            <Link href="/brancher">Brancher</Link>
          </nav>
          <div className="right">
            <Link href="/tilmeld" className="nav-cta">Kom i gang nu</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap center" style={{ position: "relative", zIndex: 2 }}>
          <span className="pill">🐦 For dit fag</span>
          <h1>
            Offentlige opgaver — for <span className="sky-em">dit fag</span>
          </h1>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            Vælg din branche og se, hvordan Birdly finder de opgaver, der passer til dig — og sender dig en SMS, når der er et match.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="vals">
            {BRANCHER.map((b) => (
              <Link key={b.slug} href={"/fag/" + b.slug} className="vcard" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="ic">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 20V8l8-5 8 5v12" stroke="#2EB7FF" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 20v-6h6v6" stroke="#2EB7FF" strokeWidth="1.8" />
                  </svg>
                </div>
                <h4>{b.label}</h4>
                <p>Se opgaver for {b.nounPlural}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
