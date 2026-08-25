import Link from "next/link";
import { notFound } from "next/navigation";
import VidenRamme from "../../../components/VidenRamme";
import { GUIDES, erKlar, getGuide, kategoriNavn } from "../../../lib/viden";
import { getBranche } from "../../../lib/branche";
import { abs } from "../../../lib/site";
import "../../forside.css";
import "../viden.css";

// ============================================================================
// /viden/[slug] — guide-skabelonen. ANSWER-FIRST.
//
// ⚠️ REKKEFØLGEN ER HELE POINTEN. H1 er spørgsmålet, ordret. Derefter svaret —
// før al kontekst, før historik, før "i en digitaliseret verden". En answer
// engine citerer det første afsnit der faktisk besvarer overskriften; står der
// en indledning dér, citerer den indledningen, eller den citerer en anden side.
//
// ⚠️ SVARET SKAL KUNNE STÅ ALENE. `kortSvar` rives ud af sin sammenhæng når det
// citeres. Kræver det resten af siden for at give mening, er det skrevet forkert
// — det er en redaktionel regel, ikke en teknisk.
//
// ⚠️ SIDEN PUBLICERES IKKE UDEN TEKST. Uden kortSvar og afsnit svarer ruten 404
// frem for at vise en tom skabelon. En tom guide er en tynd side, og otte af dem
// ville skade sitet mere end de gavner. Se noten i lib/viden.js.
//
// ⚠️ FAQPage-SCHEMA KUN VED ÆGTE Q&A — og her ER det ægte: guidernes H2'er ER
// spørgsmålene, og afsnittet under er svaret. Schemaet bygges derfor af de H2'er
// der ender på "?", ikke af en parallel liste. Har en guide hverken
// spørgsmåls-H2'er eller et eksplicit `sporgsmaal`-felt, udelades FAQPage helt.
// Se noten ved schemaFor().
// ============================================================================

export function generateStaticParams() {
  // Kun de publicerede. Ufærdige guides skal ikke prerenderes.
  return GUIDES.filter(erKlar).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g || !erKlar(g)) return { robots: { index: false, follow: false } };
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/viden/${g.slug}` },
    openGraph: {
      title: g.title, description: g.description, type: "article",
      locale: "da_DK", siteName: "Birdly", url: abs(`/viden/${g.slug}`),
    },
  };
}

function schemaFor(g) {
  const ud = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Forside", item: abs("/") },
        { "@type": "ListItem", position: 2, name: "Viden", item: abs("/viden") },
        { "@type": "ListItem", position: 3, name: g.h1, item: abs(`/viden/${g.slug}`) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.h1,
      description: g.description,
      // ⚠️ ORGANISATIONEN SOM FORFATTER, ikke en opfundet person. "Skrevet af
      // Birdly" er sandt; et personnavn med titler ville være en påstand om
      // credentials vi ikke kan dokumentere.
      author: { "@type": "Organization", name: "Birdly", url: abs("/") },
      publisher: { "@type": "Organization", name: "Birdly", url: abs("/") },
      inLanguage: "da-DK",
      mainEntityOfPage: { "@type": "WebPage", "@id": abs(`/viden/${g.slug}`) },
      ...(g.opdateret ? { dateModified: g.opdateret } : {}),
    },
  ];
  // ⚠️ FAQPage BYGGES AF DE H2'ER DER FAKTISK ER SPØRGSMÅL. Guidernes struktur er
  // answer-first: hver H2 der ender på "?" er et spørgsmål, og afsnittet under er
  // svaret. Det ER synligt Q&A — bare skrevet som artikel frem for som accordion,
  // og schemaet skal beskrive det der står på siden, ikke en parallel struktur.
  //
  // ⚠️ "Det korte svar" og "Sådan fungerer det" ryger IKKE med: de er ikke
  // spørgsmål, og et Question uden spørgsmålstegn er markup der beskriver noget
  // andet end indholdet. Filteret er derfor selve tegnet, ikke en liste.
  //
  // ⚠️ EKSPLICITTE `sporgsmaal` VINDER, hvis en guide en dag får et rigtigt
  // Q&A-afsnit — så beskriver schemaet dét frem for at gætte ud fra overskrifter.
  const fraAfsnit = (g.afsnit || [])
    .filter((a) => String(a.h2 || "").trim().endsWith("?"))
    .map((a) => ({ q: a.h2, a: a.tekst }));
  const qa = Array.isArray(g.sporgsmaal) && g.sporgsmaal.length ? g.sporgsmaal : fraAfsnit;
  if (qa.length) {
    ud.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qa.map((s) => ({
        "@type": "Question",
        name: s.q,
        acceptedAnswer: { "@type": "Answer", text: s.a },
      })),
    });
  }
  return ud;
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g || !erKlar(g)) notFound();

  const relaterede = (g.relaterede || []).map(getGuide).filter((x) => x && erKlar(x));
  const brancher = (g.brancher || []).map(getBranche).filter(Boolean);
  const kat = kategoriNavn(g.kategori);

  return (
    <VidenRamme
      broedkrumme={[{ navn: "Forside", href: "/" }, { navn: "Viden", href: "/viden" }, { navn: g.h1 }]}
    >
      {schemaFor(g).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <article className="viden-artikel">
        <div className="wrap">
          {kat && <span className="kick">{kat}</span>}
          <h1>{g.h1}</h1>

          {/* SVARET FØRST. Se noten øverst — dette er den tekst der bliver citeret. */}
          <div className="viden-svar">
            <h2>Det korte svar</h2>
            <p>{g.kortSvar}</p>
          </div>

          {g.afsnit.map((a) => (
            <section key={a.h2}>
              <h2>{a.h2}</h2>
              {String(a.tekst).split("\n\n").map((afs, i) => <p key={i}>{afs}</p>)}
            </section>
          ))}

          {Array.isArray(g.sporgsmaal) && g.sporgsmaal.length > 0 && (
            <section>
              <h2>Spørgsmål og svar</h2>
              {/* Synligt indhold FØRST, schema bagefter — aldrig omvendt. */}
              {g.sporgsmaal.map((s) => (
                <div className="viden-qa" key={s.q}>
                  <h3>{s.q}</h3>
                  <p>{s.a}</p>
                </div>
              ))}
            </section>
          )}

          {g.opdateret && (
            <p className="viden-opdateret">
              Sidst opdateret: {new Date(g.opdateret).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          {Array.isArray(g.kilder) && g.kilder.length > 0 && (
            <section className="viden-kilder">
              <h2>Kilder</h2>
              <ul>
                {g.kilder.map((k) => (
                  <li key={k.url}>
                    <a href={k.url} target="_blank" rel="noopener noreferrer nofollow">{k.navn}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="cta" style={{ marginTop: 28 }}>
            <Link href="/kom-i-gang" className="btn btn-teal">Find opgaver nu</Link>
          </div>
        </div>
      </article>

      {/* ⚠️ INTERNE LINKS DER FAKTISK HJÆLPER. Guide -> relaterede guides og de
          brancher spørgsmålet er relevant for. Ikke en link-mur: er der intet
          relevant at pege på, står sektionen der slet ikke. */}
      {(relaterede.length > 0 || brancher.length > 0) && (
        <section className="viden-relateret">
          <div className="wrap">
            {relaterede.length > 0 && (
              <>
                <h2 className="big">Læs også</h2>
                <div className="viden-grid">
                  {relaterede.map((r) => (
                    <Link href={`/viden/${r.slug}`} className="viden-kort" key={r.slug}>
                      <h3>{r.h1}</h3>
                      <span className="viden-mere">Læs svaret &rarr;</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
            {brancher.length > 0 && (
              <p className="viden-fag">
                Se opgaver for{" "}
                {brancher.map((b, i) => (
                  <span key={b.slug}>
                    {i > 0 && (i === brancher.length - 1 ? " og " : ", ")}
                    <Link href={`/fag/${b.slug}`}>{b.label.toLowerCase()}</Link>
                  </span>
                ))}
                .
              </p>
            )}
          </div>
        </section>
      )}
    </VidenRamme>
  );
}
