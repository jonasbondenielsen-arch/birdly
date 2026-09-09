import Link from "next/link";
import { Logo } from "../Logo";
import Cta from "./Cta";
import { OPRET_OPGAVE_I_NAV } from "../../lib/opretOpgave";

// ⚠️ HEADEREN MÅ HELLER IKKE IMPORTERE ORDBOGEN — OG DET ER IKKE INDLYSENDE.
// SalgHeader er selv en serverkomponent, men den importeres AF components/
// Forside.js, som er "use client". Dermed havner headeren og alt hvad den
// importerer i forsidens KLIENT-bundt. Da jeg lagde `tekster` ind her, kom
// både den danske og den engelske ordbog med tilbage — og forsiden var den
// eneste side der flyttede sig af det (målt 09-09-2026: RSC-rækkerne blev
// nummereret om fra række `f`).
//
// Teksten kommer derfor ind som `ctaTekst` fra den der bruger headeren.
// Ingen prop = husets danske CTA. Se den fulde note i Cta.js.

// ============================================================================
// HEADEREN — sticky, ren, én primær handling.
//
// ⚠️ "OPRET OPGAVE" MÅ ALDRIG KONKURRERE VISUELT med "Find opgaver nu". De to
// taler til hver sin person: den ene til en virksomhed der vil HAVE opgaver, den
// anden til en privatperson der HAR en. Bliver de lige tydelige, klikker
// håndværkeren på den forkerte og lander i en formular hvor han skal beskrive et
// arbejde han gerne vil udføre. Derfor er efterspørgselssiden tekst-med-ramme,
// aldrig en fyldt knap — og den bor bag det eksisterende flag
// (NEXT_PUBLIC_OPRET_OPGAVE), så indgangen ikke kan stå ét sted og mangle et andet.
//
// ⚠️ MENUPUNKTERNE PEGER PÅ RIGTIGE RUTER, ikke på ankre. På forsiden fandtes
// "Priser" og "Hvorfor Birdly" kun som #priser/#hvorfor, og "Viden" fandtes slet
// ikke i navigationen — ni publicerede guides lå i sitemap'et uden et eneste
// link fra menuen. Google kunne finde dem; en besøgende kunne ikke.
//
// ⚠️ INGEN BURGER-MENU MED JAVASCRIPT. Den gamle header har en .burger der aldrig
// fik kode. Her forsvinder menupunkterne i stedet under 1024px, og de to
// handlinger bliver stående — det er dem der betyder noget på en telefon, og
// resten af sitet nås fra footeren. En menu ingen kan åbne er værre end ingen menu.
// ============================================================================
export default function SalgHeader({ funnelHref, marked = "DK", ctaTekst = null, ord = null, wordmark = null }) {
  // ⚠️ GB HAR NU SIT EGET NAV (09-09-2026). Det havde ingen indtil da, og
  // det var rigtigt paa det tidspunkt: alle fem danske punkter peger paa
  // DANSKE sider, og et britisk klik paa "Priser" ville lande i dansk tekst.
  //
  // Nu peger de britiske punkter paa ANKRE paa /uk i stedet - fire punkter der
  // alle findes. Ingen doede links, og ingen "For your trade": markedet er
  // cleaning-only, og en brancheoversigt ville love tyve fag vi ikke har.
  // Listen bor i ordbogen (lib/tekster/en.js → nav.punkter).
  const navPunkter = ord?.punkter || null;

  return (
    <header className="sg-top">
      <div className="sg-wrap sg-bar">
        <Logo height={32} {...(wordmark ? { wordmark } : null)} />
        {/* ⚠️ ÉT UDTRYK, IKKE TO SØSKENDE. Første udgave havde den danske nav
            og den britiske som hver sit `{cond && …}`. For DK gav det
            ét <nav> OG et `null` — og et null optager stadig en plads i
            RSC-strømmen. Fire danske sider flyttede sig af det (målt
            09-09-2026), uden at noget synligt ændrede sig.
            Samme lektie som `ord={null}`: en tom værdi er ikke ingen værdi.
            Med én ternary har DK nøjagtig det ene barn den havde før. */}
        {marked === "DK" ? (
          <nav className="sg-nav">
            <Link href="/sadan-virker-det">Sådan virker det</Link>
            <Link href="/brancher">Brancher</Link>
            <Link href="/priser">Priser</Link>
            <Link href="/hvorfor-birdly">Hvorfor Birdly</Link>
            <Link href="/viden">Viden</Link>
          </nav>
        ) : navPunkter ? (
          /* Britisk nav: samme plads, samme klasse, ankre i stedet for ruter. */
          <nav className="sg-nav">
            {navPunkter.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
        ) : null}
        <div className="sg-hoejre">
          {marked === "DK" && OPRET_OPGAVE_I_NAV && (
            <Link href="/opret-opgave" className="sg-navcta-2">Opret opgave</Link>
          )}
          {/* Variant "nav": samme tekst og samme klik-sporing som sidens øvrige
              CTA'er, men den kompakte header-stil. */}
          <Cta href={funnelHref} placering="header" variant="nav" {...(ctaTekst ? { tekst: ctaTekst } : null)} />
        </div>
      </div>
    </header>
  );
}
