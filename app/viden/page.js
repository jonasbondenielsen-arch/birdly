import Link from "next/link";
import VidenRamme from "../../components/VidenRamme";
import { KLARE_GUIDES, VIDEN_KATEGORIER, kategoriNavn } from "../../lib/viden";
import { abs } from "../../lib/site";
import "../forside.css";
import "./viden.css";

// ============================================================================
// /viden — forsiden i vidensuniverset.
//
// ⚠️ SIDEN ER noindex INDTIL DER ER MINDST ÉN FÆRDIG GUIDE. En oversigtsside
// over ingenting er en tynd side, og den ville være den første Google så af
// hele /viden. Betingelsen er data, ikke et flag: i samme øjeblik en guide får
// tekst, bliver siden indekserbar af sig selv.
// ============================================================================

const HAR_INDHOLD = KLARE_GUIDES.length > 0;

const TITLE = "Viden om opgaver og udbud | Birdly";
const BESKRIVELSE =
  "Korte, konkrete svar til virksomheder, der vil bruge mindre tid på at lede efter den næste opgave.";

export const metadata = {
  title: TITLE,
  description: BESKRIVELSE,
  alternates: { canonical: "/viden" },
  openGraph: {
    title: TITLE, description: BESKRIVELSE, type: "website",
    locale: "da_DK", siteName: "Birdly", url: abs("/viden"),
  },
  ...(HAR_INDHOLD ? {} : { robots: { index: false, follow: true } }),
};

// ⚠️ ItemList AFSPEJLER KUN DE PUBLICEREDE. Schema må aldrig love sider der ikke
// findes — en crawler der følger et dødt link mister tillid til resten.
const SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Viden", item: abs("/viden") },
    ],
  },
  ...(HAR_INDHOLD
    ? [{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Viden om opgaver og udbud",
        numberOfItems: KLARE_GUIDES.length,
        itemListElement: KLARE_GUIDES.map((g, i) => ({
          "@type": "ListItem", position: i + 1, name: g.h1, url: abs("/viden/" + g.slug),
        })),
      }]
    : []),
];

export default function VidenPage() {
  return (
    <VidenRamme broedkrumme={[{ navn: "Forside", href: "/" }, { navn: "Viden" }]}>
      {SCHEMA.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <section className="hero">
        <div className="wrap center" style={{ position: "relative", zIndex: 2 }}>
          <span className="pill">🐦 Viden</span>
          <h1>Viden om opgaver og udbud</h1>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>{BESKRIVELSE}</p>
        </div>
      </section>

      {HAR_INDHOLD ? (
        VIDEN_KATEGORIER.map((k) => {
          const iKat = KLARE_GUIDES.filter((g) => g.kategori === k.key);
          if (!iKat.length) return null;
          return (
            <section key={k.key}>
              <div className="wrap">
                <h2 className="big" style={{ marginBottom: 18 }}>{k.navn}</h2>
                <div className="viden-grid">
                  {iKat.map((g) => (
                    <Link href={`/viden/${g.slug}`} className="viden-kort" key={g.slug}>
                      <h3>{g.h1}</h3>
                      <p>{g.description}</p>
                      <span className="viden-mere">Læs svaret &rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })
      ) : (
        // Ærligt tomrum frem for udfyldningstekst. Siden er noindex imens, så den
        // her tilstand ses kun af den der åbner adressen direkte.
        <section>
          <div className="wrap center" style={{ maxWidth: 720 }}>
            <p className="lead">Guides er på vej. Imens finder du svar på de mest stillede spørgsmål i{" "}
              <a href="/#faq">vores FAQ</a> — og din branche under <Link href="/brancher">Brancher</Link>.
            </p>
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="wrap center">
          <h2 className="big">Slip for selv at lede efter opgaver.</h2>
          <p className="lead">Birdly finder relevante offentlige og private opgaver og sender dig besked, når der er et match.</p>
          <div className="cta" style={{ justifyContent: "center", marginTop: 18 }}>
            <Link href="/kom-i-gang" className="btn btn-teal">Find opgaver nu</Link>
          </div>
        </div>
      </section>
    </VidenRamme>
  );
}
