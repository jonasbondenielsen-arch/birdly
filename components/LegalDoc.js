import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "./Footer";
import { Logo } from "./Logo";
import "../app/legaldoc.css";

// Renders a legal document (markdown string) as a readable document page:
// shared sub-page header (same Birdly logo) + GFM markdown (headings, lists,
// tables, links) + shared <Footer />. The document's own H1 is the page title.

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
          <Logo height={30} />
          <Link href="/betingelser" className="back">← Betingelser &amp; sikkerhed</Link>
        </div>
      </header>

      <main className="doc">
        <article className="doc-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MdLink }}>
            {markdown}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
