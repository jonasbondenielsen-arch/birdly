import Link from "next/link";
import { Logo, BirdMark } from "../../../components/Logo";
import SaetLang from "../../../components/uk/SaetLang";
import FooterUk from "../../../components/uk/FooterUk";
import { hubKort, hubIndledning, ukSti, UK_BASE } from "../../../lib/uk/jura";
import { tekster } from "../../../lib/tekster";
import { baseUrl, MARKEDER } from "../../../lib/markets";
import "../../betingelser.css";

const GB = MARKEDER.GB;

// ============================================================================
// UK'S JURA-HUB — SAMME SIDE SOM DK's /betingelser, PAA ENGELSK.
//
// ⚠️ STRUKTUREN ER DK's, INDHOLDET ER PAKKENS. De to faciter maa ikke
// blandes: layout, kort-grid, ikoner og raekkefoelge spejler
// app/betingelser/page.js, mens hver titel, beskrivelse og knap-tekst er
// klippet ordret ud af jura-pakkens egen "## Documents"-sektion.
// 1:1 betyder samme oplevelse og navigation — ikke samme ordlyd. De engelske
// dokumenter ER med vilje anderledes (UK-repraesentant, ICO, UCTA, DPA, VAT).
//
// ⚠️ ALLE NI DOKUMENTER SKAL VAERE HER. Ingen af dem maa kun kunne naas
// fra footeren, og ingen maa staa uden et kort. scripts/verify-uk-jura.mjs
// faelder beviset hvis et dokument mangler sin plads.
//
// ⚠️ DK's KORT FOR PRIVATE OPGAVER ER BAG ET LAUNCH-FLAG. Det gaelder
// tjenesten i Danmark; den britiske Private Job Terms er en del af pakkens
// route-map og staar derfor med. Forskellen er bevidst.
//
// ⚠️ INGEN ADRESSE-BLOK. Pakkens hub slutter med Birdly.dk's postadresse;
// den staar allerede i footerens firmalinje, og to udgaver af den samme
// adresse er en der kan blive forkert.
// ============================================================================

export const metadata = {
  title: "Terms & Security | Birdly",
  alternates: { canonical: baseUrl("GB") + "/terms" },
  robots: GB.lanceret ? undefined : { index: false, follow: false },
};

const ICONS = {
  // Handelsbetingelser → dokument/aftale m. flueben
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 14l2.2 2.2L15 12" />
    </svg>
  ),
  // Abonnementsbetingelser → betalingskort m. abonnements-cirkel.
  // Samme sprog som de øvrige: viewBox 24, stroke-width 2, runde hjørner.
  kort: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 14.5h3" />
    </svg>
  ),
  // Privatlivspolitik → skjold m. flueben
  shieldCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  // Cookiepolitik → cookie
  cookie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
    </svg>
  ),
  // Sikkerhed og drift → hængelås m. nøglehul
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 018 0v3.5" />
      <path d="M12 14v2.5" />
    </svg>
  ),
  // Underdatabehandlere → server/database
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  ),
};

// Samme ikon-raekkefoelge som DK's hub, saa de to sider laeses ens.
const IKON_FOR = {
  "/terms-and-conditions": ICONS.doc,
  "/subscription-terms": ICONS.kort,
  "/terms-of-use": null, // fuglemaerket, som DK
  "/private-job-terms": ICONS.doc,
  "/privacy-policy": ICONS.shieldCheck,
  "/cookie-policy": ICONS.cookie,
  "/security": ICONS.lock,
  "/sub-processors": ICONS.database,
  "/data-processing-agreement": ICONS.doc,
};

const FREMHAEVET = ["/terms-and-conditions", "/subscription-terms"];

export default function Side() {
  const T = tekster("GB");
  const ind = hubIndledning();
  const kort = hubKort();

  return (
    <div className="birdly-betingelser">
      <SaetLang lang="en-GB" />
      <header>
        <div className="bar">
          <Logo height={32} wordmark={T.footer.brand} />
          <Link href={UK_BASE} className="back">{T.jura.tilbageForside}</Link>
        </div>
      </header>

      <div className="hero">
        <h1>{ind.overskrift}</h1>
        {ind.brod.map((p) => <p key={p}>{p}</p>)}
      </div>

      <div className="wrap">
        <div className="section-title">{T.jura.dokumenter}</div>
        <div className="cards">
          {kort.map((k) => (
            <Link
              key={k.rute}
              href={ukSti(k.rute)}
              className={"card" + (FREMHAEVET.includes(k.rute) ? " featured" : "")}
            >
              {IKON_FOR[k.rute] ? (
                <div className="ic">{IKON_FOR[k.rute]}</div>
              ) : (
                <div className="ic ic-bird"><BirdMark size={48} /></div>
              )}
              <h3>{k.titel}</h3>
              <p>{k.beskrivelse}</p>
              <span className="btn">{k.knap}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ⚠️ FooterUk, IKKE den delte Footer. En ny importoer af Footer
          aendrede chunk-grupperingen og lagde et ekstra <script> paa to
          danske sider - se noten i components/uk/FooterUk.js. */}
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
