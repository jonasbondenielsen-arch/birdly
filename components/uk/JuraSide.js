import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Logo } from "../Logo";
import SaetLang from "./SaetLang";
import { tekster } from "../../lib/tekster";
import { ukSti } from "../../lib/uk/jura";
import "../../app/legaldoc.css";
import "./jura.css";

// ============================================================================
// EN BRITISK JURASIDE.
//
// ⚠️ TEKSTEN RENDRES, DEN SKRIVES IKKE. Markdown'en kommer ordret fra
// jura-pakken via lib/uk/jura.js. Der er ingen tekst i den her fil ud over
// DRAFT-banneret og navigationen — og det er med vilje: en juraside hvor
// komponenten kunne omformulere indholdet, ville før eller siden gøre det.
//
// ⚠️ DRAFT-BANNERET ER IKKE PYNT. Siderne er DRAFT + noindex og gælder IKKE
// rigtige betalende kunder før UK-kvalificeret jura-review og Jonas' ja.
// Uden et synligt banner ville en af os om tre uger åbne /uk/privacy-policy,
// se en færdig-udseende side og tro den var gældende. Banneret tæller
// desuden de uudfyldte placeholders, så det er umuligt at overse at fx
// UK-repræsentanten mangler.
//
// ⚠️ PLACEHOLDERNE STÅR I TEKSTEN, SOM PAKKEN SKREV DEM. Jeg erstatter dem
// ikke med pænere markører: pakken flager dem selv med versaler, og at
// omskrive dem ville være at røre jura-teksten. Banneret gør dem synlige.
// ============================================================================

export default function JuraSide({ side, marked = "GB" }) {
  const T = tekster(marked);
  const antalAabne = side.aabne.length;

  return (
    <main className="birdly-legaldoc uk-jura" lang="en-GB">
      <SaetLang lang="en-GB" />
      <header className="uk-jura-top">
        <Logo height={30} wordmark={T.footer.brand} />
        <Link href={ukSti("/terms")} className="uk-jura-tilbage">
          {T.jura.tilbage}
        </Link>
      </header>

      {/* ⚠️ VISES ALTID SÅ LÆNGE SIDEN ER DRAFT. Den dag juraen er godkendt,
          fjernes banneret ét sted — ikke ti. */}
      <div className="uk-jura-draft" role="note">
        <b>{T.jura.draftTitel}</b>
        <p>{T.jura.draftBrod}</p>
        {antalAabne > 0 && (
          <p className="uk-jura-todo">
            {T.jura.todoLabel} {side.aabne.join(", ")}
          </p>
        )}
      </div>

      <article className="uk-jura-krop">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{side.md}</ReactMarkdown>
      </article>
    </main>
  );
}
