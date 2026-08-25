import Link from "next/link";
import Footer from "./Footer";
import { Logo } from "./Logo";
import OpretOpgaveCta from "./OpretOpgaveCta";
import { OPRET_OPGAVE_I_NAV } from "../lib/opretOpgave";

// ============================================================================
// FÆLLES RAMME OM /viden — samme header, footer og designsystem som resten.
//
// ⚠️ /viden MÅ IKKE LIGNE EN SEPARAT SEO-BLOG. Den genbruger .birdly-home og
// forside.css, så en besøgende der klikker fra en brancheside ikke oplever at
// være landet et andet sted. Et vidensunivers med sit eget udseende læses som
// indhold der er lavet for søgemaskiner — og det er præcis dét, det ikke må være.
//
// ⚠️ "Viden" STÅR IKKE I HOVEDNAVIGATIONEN. Menuen er købsrejsen (hvorfor,
// hvordan, priser, FAQ, brancher); guides er noget man lander på fra en søgning
// eller et internt link. Indgangen er diskret i footeren — se Footer.js.
//
// ⚠️ SEMANTISK HTML MED VILJE: <header>, <nav>, <main>, <article>, <footer>.
// Det hjælper skærmlæsere og de agenter der læser siden uden at rendere den.
// ============================================================================

export default function VidenRamme({ children, broedkrumme = null }) {
  return (
    <div className="birdly-home">
      <header>
        <div className={"wrap bar" + (OPRET_OPGAVE_I_NAV ? " bar-2cta" : "")}>
          <Logo height={32} />
          <nav className="menu" aria-label="Hovedmenu">
            <a href="/#hvorfor">Hvorfor Birdly</a>
            <a href="/#hvordan">Hvordan virker det</a>
            <a href="/#priser">Priser</a>
            <a href="/#faq">FAQ</a>
            <Link href="/brancher">Brancher</Link>
          </nav>
          <div className="right">
            <Link href="/kom-i-gang" className="nav-cta">Find opgaver nu</Link>
            <OpretOpgaveCta />
          </div>
        </div>
      </header>

      {/* Synlig brødkrumme, ikke kun schema: den fortæller både læseren og en
          crawler hvor siden hører hjemme, og giver et vej-tilbage-link der ikke
          afhænger af browserens historik. */}
      {broedkrumme && (
        <nav className="viden-krumme" aria-label="Brødkrumme">
          <div className="wrap">
            {broedkrumme.map((b, i) => (
              <span key={b.href || b.navn}>
                {i > 0 && <span aria-hidden="true"> / </span>}
                {b.href ? <Link href={b.href}>{b.navn}</Link> : <span aria-current="page">{b.navn}</span>}
              </span>
            ))}
          </div>
        </nav>
      )}

      <main>{children}</main>
      <Footer />
    </div>
  );
}
