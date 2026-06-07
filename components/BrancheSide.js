import Link from "next/link";
import Footer from "./Footer";
import { Logo } from "./Logo";
import "../app/forside.css";

// Branche-landingsside (SEO). Server-renderet — alt indhold er i HTML ved load.
// Genbruger forsidens design (.birdly-home + forside.css): samme header, hero,
// kort (.vals/.vcard), FAQ (.faq-list/details) og CTA-bånd (.ctaband). Ingen nyt
// designsprog. Data kommer fra lib/branche.js.

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="10" fill="#00B3A6" />
    <path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HouseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 20V8l8-5 8 5v12" stroke="#2EB7FF" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 20v-6h6v6" stroke="#2EB7FF" strokeWidth="1.8" />
  </svg>
);

export default function BrancheSide({ data }) {
  const { nounPlural, nounSingular, fagKey, arbejde, ex1, ex2, kortSvarExtra, whyHeading, whyText, eksemplerIntro, examples, faq } = data;
  const tilmeld = "/tilmeld?fag=" + fagKey;

  // Ren FAQ-structured-data (FAQPage) til Google.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="birdly-home">
      {/* HEADER — samme som forsiden */}
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
            <Link href={tilmeld} className="nav-cta">Kom i gang</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap center" style={{ position: "relative", zIndex: 2 }}>
          <span className="pill">🐦 Gratis i 14 dage — ingen binding</span>
          <h1>
            Offentlige opgaver for {nounPlural}
            <br />— direkte på <span className="sky-em">SMS</span>
          </h1>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            Kommuner, regioner og staten har hele tiden opgaver til {nounPlural}. Birdly finder dem, der passer til dit firma, og sender dig en SMS, når der er et match.
          </p>
          <div className="checks" style={{ justifyContent: "center" }}>
            <span><Check /> Kun opgaver, der passer til dig</span>
            <span><Check /> Direkte på SMS og mail</span>
          </div>
          <div className="cta" style={{ justifyContent: "center" }}>
            <Link href={tilmeld} className="btn btn-teal">Start gratis som {nounSingular}</Link>
          </div>
        </div>
      </section>

      {/* DET KORTE SVAR */}
      <section>
        <div className="wrap center" style={{ maxWidth: 820 }}>
          <span className="kick">Det korte svar</span>
          <h2 className="big">Ja — også dit firma kan byde.</h2>
          <p className="lead">
            Det offentlige køber hele tiden {arbejde} hos private firmaer — fra {ex1} til {ex2}. Du behøver ikke være stor. Du skal bare kunne se opgaverne i tide — og det er præcis det, Birdly hjælper med.{kortSvarExtra ? " " + kortSvarExtra : ""}
          </p>
        </div>
      </section>

      {/* HVORFOR OFFENTLIGE OPGAVER */}
      <section>
        <div className="wrap center" style={{ maxWidth: 820 }}>
          <span className="kick">Hvorfor det er værd at kigge</span>
          <h2 className="big">{whyHeading}</h2>
          <p className="lead">{whyText}</p>
        </div>
      </section>

      {/* EKSEMPLER */}
      <section className="examples">
        <div className="wrap center">
          <span className="kick">Eksempler</span>
          <h2 className="big">Sådan kan opgaverne se ud</h2>
          {eksemplerIntro && <p className="lead">{eksemplerIntro}</p>}
        </div>
        <div className="wrap">
          <div className="vals">
            {examples.map((e) => (
              <div className="vcard" key={e.title}>
                <div className="ic"><HouseIcon /></div>
                <h4>{e.title}</h4>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap center">
          <span className="kick">FAQ</span>
          <h2 className="big">Godt at vide</h2>
        </div>
        <div className="faq-list">
          {faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span className="pm">+</span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* AFSLUTTENDE CTA */}
      <section className="ctaband">
        <div className="wrap">
          <h2>Klar til at fange din næste opgave?</h2>
          <p>Gratis i 14 dage, ingen binding. Du kan altid ændre dine valg eller stoppe igen.</p>
          <Link href={tilmeld} className="btn btn-teal">Start gratis som {nounSingular}</Link>
        </div>
      </section>

      <Footer />

      {/* FAQ structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </div>
  );
}
