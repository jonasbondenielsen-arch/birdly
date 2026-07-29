import Link from "next/link";
import Footer from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { BRANCHER } from "../../lib/branche";
import { abs } from "../../lib/site";
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
    url: abs("/brancher"),
  },
};

// Brødkrumme + liste. /brancher er knudepunktet mellem forsiden og de 20 fag-sider, og
// var den eneste side helt uden strukturerede data. ItemList fortæller Google at de 20
// links hører sammen som ét sæt frem for at være tilfældig navigation — det er dét der
// får undersiderne til at blive opdaget som en gruppe.
const BRANCHER_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Brancher", item: abs("/brancher") },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Brancher hos Birdly",
    numberOfItems: BRANCHER.length,
    itemListElement: BRANCHER.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.label,
      url: abs("/fag/" + b.slug),
    })),
  },
];

export default function BrancherPage() {
  return (
    <div className="birdly-home">
      {BRANCHER_SCHEMA.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
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
