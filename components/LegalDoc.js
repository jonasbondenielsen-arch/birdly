import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "./Footer";
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
          <Link href="/" className="logo">
            <svg width="30" height="26" viewBox="0 0 48 40" fill="none"><defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#0D1B2A" /><stop offset=".45" stopColor="#2EB7FF" /><stop offset="1" stopColor="#9BDCFF" /></linearGradient></defs><path d="M4 31 Q24 27 46 6 Q27 15 9 27 Z" fill="url(#wg)" /><path d="M6 35 Q22 32 39 18 Q25 23 11 31 Z" fill="url(#wg)" opacity=".8" /></svg>
            <span>Birdly<span className="dk">.dk</span></span>
          </Link>
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
