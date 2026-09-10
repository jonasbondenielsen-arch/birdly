import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Logo } from "../../../components/Logo";
import { tekster } from "../../../lib/tekster";
import { juraAfsnit } from "../../../lib/uk/jura";
import { baseUrl, MARKEDER } from "../../../lib/markets";
import "../../legaldoc.css";
import "../../../components/uk/jura.css";

const GB = MARKEDER.GB;
const AFSNIT = "## 12. Problems with a business";

// ============================================================================
// "REPORT A PROBLEM" — jura-pakkens note 11.
//
// ⚠️ SIDEN SKRIVER INGEN NY TEKST. Note 11 beder om "a visible Report a
// problem route/contact for Private Jobs", men giver ingen ordlyd. Private Job
// Terms §12 ER ordlyden: den siger allerede hvad man gør først, hvad Birdly
// ikke kan afgøre, og hvor man skriver hen ved svindel eller sikkerhedsrisiko.
//
// Havde jeg skrevet en ny forklaring her, ville vi have to udgaver af den
// samme rettighed — og den dag §12 rettes, ville kun den ene følge med.
// Afsnittet hentes derfor fra lib/uk/jura.js og er dækket af
// scripts/verify-uk-jura.mjs som alt andet jura.
//
// ⚠️ ADRESSEN ER §12's EGEN (support@birdly.dk), ikke den britiske support.
// Jonas' regel er britiske adresser i UK-vendt tekst — men §12 bruger
// bevidst den danske entitet, og en anden adresse HER end i betingelserne
// ville betyde at siden og aftalen sagde to forskellige ting. Flagget.
// ============================================================================

export const metadata = {
  title: "Report a problem | Birdly",
  alternates: { canonical: baseUrl("GB") + "/report-a-problem" },
  robots: GB.lanceret ? undefined : { index: false, follow: false },
};

export default function Side() {
  const T = tekster("GB");
  const md = juraAfsnit("/private-job-terms", AFSNIT);

  return (
    <main className="birdly-legaldoc uk-jura" lang="en-GB">
      <header className="uk-jura-top">
        <Logo height={30} wordmark={T.footer.brand} />
        <Link href="/terms" className="uk-jura-tilbage">{T.jura.tilbage}</Link>
      </header>

      <div className="uk-jura-draft" role="note">
        <b>{T.jura.draftTitel}</b>
        <p>{T.jura.draftBrod}</p>
      </div>

      <article className="uk-jura-krop">
        <h1>{T.jura.rapporter}</h1>
        {md ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        ) : null}
        <p>
          <Link href="/private-job-terms">{T.jura.rapporterLink}</Link>
        </p>
      </article>
    </main>
  );
}
