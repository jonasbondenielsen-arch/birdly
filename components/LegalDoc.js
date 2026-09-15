import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "./Footer";
import { Logo } from "./Logo";
import "../app/legaldoc.css";

// Renders a legal document (markdown string) as a readable document page:
// shared sub-page header (same Birdly logo) + GFM markdown (headings, lists,
// tables, links) + shared <Footer />. The document's own H1 is the page title.

// ============================================================================
// OVERSKRIFTER FAAR STABILE ID'er (15-09-2026).
//
// ⚠️ DE FANDTES IKKE FOER, OG DERFOR VAR HVERT ANKER-LINK DOEDT.
// GARANTI_LINK pegede paa "/handelsbetingelser#matchgaranti" tre steder.
// ReactMarkdown saetter ingen id'er af sig selv, saa det eneste id paa hele
// siden var Reacts egen. Kunden landede oeverst i et langt dokument og skulle
// selv finde punktet.
//
// ⚠️ SLUGGEN UDLEDES AF OVERSKRIFTENS EGEN TEKST. Et haandholdt id-kort ville
// skride fra dokumentet foerste gang en overskrift blev omformuleret. Aendres
// en overskrift, aendres ankeret med - og det er aerligere at et link saa
// lander oeverst end at det lander paa et forkert punkt.
//
// ⚠️ DANSKE BOGSTAVER TRANSLITERERES. ae/oe/aa frem for %C3%A6 i adresselinjen:
// et anker skal kunne kopieres ind i en mail uden at se ud som en fejl.
// ============================================================================
function slug(children) {
  const tekst = (Array.isArray(children) ? children : [children])
    .map((c) => (typeof c === "string" ? c : typeof c?.props?.children === "string" ? c.props.children : ""))
    .join("");
  return tekst
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const Overskrift = (Tag) => {
  const K = ({ children }) => {
    const id = slug(children);
    return <Tag id={id || undefined}>{children}</Tag>;
  };
  K.displayName = `Md${Tag.toUpperCase()}`;
  return K;
};

// External links open in a new tab; keep supplier links clickable + safe.
function MdLink({ href, children }) {
  const external = href && /^https?:\/\//i.test(href);
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <a href={href}>{children}</a>;
}

export default function LegalDoc({ markdown }) {
  return (
    <div className="birdly-legaldoc">
      <header>
        <div className="bar">
          <Logo height={32} />
          <Link href="/betingelser" className="back">← Betingelser &amp; sikkerhed</Link>
        </div>
      </header>

      <main className="doc">
        <article className="doc-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: MdLink,
              h2: Overskrift("h2"),
              h3: Overskrift("h3"),
              h4: Overskrift("h4"),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
