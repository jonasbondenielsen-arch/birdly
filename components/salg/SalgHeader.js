import Link from "next/link";
import { Logo } from "../Logo";
import Cta from "./Cta";
import { OPRET_OPGAVE_I_NAV } from "../../lib/opretOpgave";

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
export default function SalgHeader({ funnelHref }) {
  return (
    <header className="sg-top">
      <div className="sg-wrap sg-bar">
        <Logo height={32} />
        <nav className="sg-nav">
          <Link href="/sadan-virker-det">Sådan virker det</Link>
          <Link href="/brancher">Brancher</Link>
          <Link href="/priser">Priser</Link>
          <Link href="/hvorfor-birdly">Hvorfor Birdly</Link>
          <Link href="/viden">Viden</Link>
        </nav>
        <div className="sg-hoejre">
          {OPRET_OPGAVE_I_NAV && (
            <Link href="/opret-opgave" className="sg-navcta-2">Opret opgave</Link>
          )}
          {/* Variant "nav": samme tekst og samme klik-sporing som sidens øvrige
              CTA'er, men den kompakte header-stil. */}
          <Cta href={funnelHref} placering="header" variant="nav" />
        </div>
      </div>
    </header>
  );
}
