import Link from "next/link";
import { Logo } from "../../components/Logo";
import SaetLang from "../../components/uk/SaetLang";
import FooterUk from "../../components/uk/FooterUk";
import { ukSti, UK_BASE } from "../../lib/uk/jura";
import { tekster } from "../../lib/tekster";
import { MARKEDER } from "../../lib/markets";
import "../betingelser.css";
import "../../components/uk/jura.css";

// ============================================================================
// DEN BRITISKE 404.
//
// ⚠️ DEN FINDES FORDI /uk ARVEDE DEN DANSKE FEJLSIDE. Huset har ingen
// app/not-found.js, saa en ukendt sti faldt ned paa Next's indbyggede
// "could not be found" inde i rodlayoutet — med dansk <title>, dansk
// samtykke-banner og lang="da". Paa getbirdly.co.uk betyder det, at et enkelt
// fejlklik viser en dansk side paa et britisk domaene. Maalt i produktion
// 10-09-2026 paa /uk/legal.
//
// ⚠️ EEN BOUNDARY DAEKKER HELE /uk. notFound() soeger opad, saa den her fil
// svarer baade for app/uk/[jura]/page.js (ukendt dokument-slug) og for
// app/uk/[...ukendt]/page.js (dybere stier). Undervejs blev der proevet med et
// layout.js og med en not-found.js i hvert segment; ingen af delene er
// noedvendige, og de er fjernet igen. At de saa ud til at vaere det, skyldtes
// at der blev maalt mod en foraeldet server — se scripts/start-server.mjs.
//
// ⚠️ INDHOLDET RENDRES KLIENTSIDE, OG DET ER NEXT'S VALG, IKKE VORES.
// En nested not-found-boundary SSR'er ikke i Next 16.2.7: serveren sender et
// tomt shell, og fejlsiden kommer med flight-payloaden. Efterproevet paa en
// verificeret frisk server, ogsaa med en triviel <p> som boundary — samme
// tomme body. Rodens indbyggede 404 og alle oevrige britiske sider SSR'er
// derimod fint. Konsekvensen er accepteret: statuskoden ER 404, siden ER
// engelsk i en browser, og GB er noindex, saa der er ingen crawler at tage
// hensyn til. At faa den til at SSR'e ville kraeve en app/not-found.js i
// RODEN — og den ville aendre DANMARKS fejlside. Den pris betaler vi ikke
// for en fejlside.
//
// ⚠️ DEN LAANER JURA-HUB'ENS CHROME. betingelser.css giver header > bar >
// back, hero og wrap; det eneste nye er de to knapper (.uk-404 i jura.css), og
// de har hub-knappens form og husets tokens. En fejlside er ikke stedet at
// opfinde et nyt udseende.
// ============================================================================
export default function IkkeFundetUk() {
  const T = tekster("GB");
  // ⚠️ ET udtryk, ikke to. React 19 kraever at <title> har ET enkelt
  // tekstbarn; `{x} | Birdly` giver et array, og saa hejses tagget ikke.
  const fanetitel = `${T.fejl404.fejlTitel} | Birdly`;

  return (
    <div className="birdly-betingelser">
      {/* ⚠️ <title> OG <meta> STAAR I TRAEET, IKKE I `metadata`.
          not-found.js er ikke en page, saa Next eksporterer ikke metadata fra
          den - uden de to linjer arvede fejlsiden rodlayoutets DANSKE title
          ("Offentlige og private opgaver direkte paa SMS"), altsaa en dansk
          fane paa et britisk domaene. React hejser begge op i <head>. */}
      <title>{fanetitel}</title>
      <meta name="robots" content="noindex, nofollow" />
      <SaetLang lang="en-GB" />

      <header>
        <div className="bar">
          <Logo height={32} wordmark={T.footer.brand} />
          <Link href={UK_BASE} className="back">{T.jura.tilbageForside}</Link>
        </div>
      </header>

      <div className="hero" lang="en-GB">
        <h1>{T.fejl404.fejlTitel}</h1>
        <p>{T.fejl404.fejlBrod}</p>
      </div>

      <div className="wrap uk-404">
        <Link href={UK_BASE} className="uk-404-primaer">{T.fejl404.fejlForside}</Link>
        <Link href={ukSti("/terms")} className="uk-404-sekundaer">{T.fejl404.fejlJura}</Link>
      </div>

      {/* ⚠️ FooterUk, IKKE den delte Footer — samme grund som paa hub'en:
          en ny importoer af components/Footer.js skiller SamtykkeLink ud i sin
          egen chunk og laegger et ekstra <script> paa to danske sider. */}
      <FooterUk
        supportMail={MARKEDER.GB.supportMail}
        ord={{
          ...T.footer,
          punkter: T.nav?.punkter || [],
          juraHref: ukSti("/terms"),
          rapporterHref: ukSti("/report-a-problem"),
          rapporter: T.jura?.rapporter,
          cookieHref: ukSti("/cookie-policy"),
          cookieValg: T.jura?.cookieValg,
        }}
      />
    </div>
  );
}
