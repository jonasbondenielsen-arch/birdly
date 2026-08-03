import Link from "next/link";
import { Logo } from "./Logo";
import Footer from "./Footer";
import { daTal, fmtOpdateret } from "../lib/opgaveTal";
import { priceText, YEARLY_SAVING, TRIAL_DAYS } from "../lib/pakke";
import { FAQ_TOP } from "../lib/faq";
import "../app/ny.css";

// ============================================================================
// Salgssiden — resultat-først. Bor på /kom-i-gang (03-08-2026).
//
// ⚠️ DEN ER FUNNELENS INDGANG — IKKE HUSETS FORSIDE. Roden (`/`) er den
// gamle forside og husets SEO-side; den her er landingssiden som annoncer og
// alle CTA-knapper peger på. Herfra går det videre til /start (CVR-funnelen) —
// aldrig omvendt. Kunden skal sælges til, før hun bliver bedt om sit CVR.
//
// ⚠️ ALLE TAL ER ÆGTE. De kommer fra get-opgave-tal, som tæller i basen. Er der
// intet tal, renderer boksen ikke — et gæt eller et nul på forsiden er værre end
// ingen boks.
//
// ⚠️ INGEN TAL PÅ FAG-KORTENE. Kortene er indgange, ikke bevis. Et
// "Catering — 1 opgave" sælger værre end ingenting, og tallet svinger med ugen.
// Tallet hører hjemme i /start's trin 3, hvor det er personligt.
//
// RÆKKEFØLGE (02-08-2026): hero → fag-kort → pris+garanti → CTA-bånd.
// "Uden Birdly / Med Birdly" og "Tre skridt" er FJERNET. Prisen er rykket op, så
// den mødes med garantien i samme øjekast — 499 kr. og "ingen match, ingen
// regning" side om side er hele argumentet.
// ============================================================================

// ⚠️ ANMELDELSER: SLÅET FRA, OG DET ER IKKE EN FORGLEMMELSE.
// Strukturen står klar nedenfor, men vi har ingen ægte anmeldelser endnu. Et
// pladsholder-citat der ser ægte ud på en live side er både løgn over for kunden
// og i strid med markedsføringsloven. Sæt den til true FØRST når der ligger
// rigtige udtalelser med navn og firma — og udfyld ANMELDELSER med dem.
const VIS_ANMELDELSER = false;
const ANMELDELSER = []; // { citat, navn, firma }

const FAG_KORT = [
  { key: "entreprenor", navn: "Entreprenør", under: "anlæg, jord, beton" },
  { key: "vvs", navn: "VVS", under: "varme, sanitet, ventilation" },
  { key: "elektriker", navn: "Elektriker", under: "installation, tavler" },
  { key: "tomrer", navn: "Tømrer", under: "tag, facade, indretning" },
  { key: "murer", navn: "Murer", under: "mur, puds, flise" },
  { key: "maler", navn: "Maler", under: "ind- og udvendig" },
  { key: "kloak", navn: "Kloak", under: "separering, TV-inspektion" },
  { key: "rengoring", navn: "Rengøring", under: "fast og periodisk" },
];


// ⚠️ SALGSSIDEN ER FØRSTE LAG, /start ER ANDET (03-08-2026). Kæden er:
//   hjemmeside-CTA / Meta-annonce → DENNE side → dens CTA → /start (CVR-funnelen)
// Kunden skal sælges til, før hun bliver bedt om sit CVR. Pegede husets knapper
// direkte på /start, landede hun i "indtast CVR" uden at have set hvad hun købte.
//
// ⚠️ fag/region SKAL FØRES VIDERE. De 36 /fag/-sider sender ?fag= og ?region= hertil,
// og de skal med ind i funnelen — ellers taber en kunde fra "Entreprenøropgaver i
// Nordjylland" sit forvalg på salgssiden, og hele pointen med landingssiden falder
// på gulvet ét skridt før mål. Værdierne sendes ordret videre; det er /start der
// validerer dem mod kataloget, så der kun findes ÉT sted at stole på dem.
export default function NyForside({ tal, fag = null, region = null }) {
  const qs = new URLSearchParams();
  if (fag) qs.set("fag", fag);
  if (region) qs.set("region", region);
  const funnel = "/start" + (qs.toString() ? `?${qs}` : "");
  // Fag-kortene sætter deres EGET fag — kunden har lige peget på det, så det slår
  // et forvalg fra adressen. Regionen følger derimod med, hvis hun kom med en.
  const fagLink = (key) => `/start?fag=${key}` + (region ? `&region=${region}` : "");
  const harTal = typeof tal?.bydbare_aabne === "number" && tal.bydbare_aabne > 0;
  const seneste = Array.isArray(tal?.seneste) ? tal.seneste.filter((n) => n?.titel) : [];
  const opdateret = fmtOpdateret(tal?.sidst_opdateret);

  return (
    <div className="ny">
      <header className="ny-top">
        <div className="ny-wrap ny-bar">
          <Logo height={32} />
          <Link href={funnel} className="ny-navcta">Find opgaver nu</Link>
        </div>
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="ny-hero">
        <div className="ny-wrap ny-herogrid">
          <div>
            <span className="ny-pill">🐦 Gratis i {TRIAL_DAYS} dage — ingen binding</span>
            <h1>Birdly arbejder allerede.<br />Du får besked på SMS.</h1>
            <p className="ny-sub">
              Vi holder øje med alle offentlige opgaver i Danmark. Passer en til dit fag,
              får du en besked. Du skal ikke lede efter noget.
            </p>
            {/* ÉN primær CTA. "Se hvordan det virker" er fjernet — to knapper ved
                siden af hinanden deler opmærksomheden og udskyder handlingen. */}
            <div className="ny-cta">
              <Link href={funnel} className="ny-btn ny-btn-teal">Find opgaver nu</Link>
            </div>
          </div>

          {harTal && (
            <aside className="ny-live" aria-label="Live-overblik">
              <div className="ny-live-h">
                <span className="ny-prik" aria-hidden="true" /> Live
              </div>
              <div className="ny-bigtal">{daTal(tal.bydbare_aabne)}</div>
              <small>opgaver med åben frist lige nu</small>

              <div className="ny-tiles">
                {typeof tal.nye_7_dage === "number" && (
                  <div className="ny-tile"><b>{daTal(tal.nye_7_dage)}</b><span>nye de sidste 7 dage</span></div>
                )}
                <div className="ny-tile"><b>2×</b><span>opdatering dagligt</span></div>
              </div>

              {/* ⚠️ ÆGTE OFFENTLIGE UDBUD — aldrig opdigtede hændelser. Hver opgave
                  i sit eget kort, så feeden kan skimmes. */}
              {seneste.length > 0 && (
                <ul className="ny-feed">
                  {seneste.map((n, i) => (
                    <li key={i} className="ny-feedkort">
                      <span className="ny-feed-t">{n.titel}</span>
                      {n.koeber && <em>{n.koeber}</em>}
                    </li>
                  ))}
                </ul>
              )}

              {/* Ægte tidspunkt for seneste hentning — ikke svartidspunktet. Mangler
                  det, står linjen der slet ikke. */}
              {opdateret && <small className="ny-opdateret">Sidst opdateret {opdateret}</small>}
            </aside>
          )}
        </div>
      </section>

      {/* ---------------- FAG-KORT ---------------- */}
      <section className="ny-sek">
        <div className="ny-wrap">
          <span className="ny-kick">Vælg din branche</span>
          <h2 className="ny-big">Hvad laver I?</h2>
          <p className="ny-lead">Klik dit fag. Så viser vi hvad vi finder til jer — og du er allerede i gang.</p>
          <div className="ny-fagg">
            {FAG_KORT.map((f) => (
              <Link key={f.key} href={fagLink(f.key)} className="ny-fagk">
                <b>{f.navn}</b>
                <span>{f.under}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRIS + GARANTI ---------------- */}
      <section className="ny-sek ny-graa">
        <div className="ny-wrap">
          <span className="ny-kick">Pris</span>
          <h2 className="ny-big">Én pris. Ingen binding.</h2>

          {/* Pris til venstre, garanti til højre — set i samme øjekast. */}
          <div className="ny-prisrow">
            {/* ⚠️ Beløbene kommer fra lib/pakke.js — hardkod dem ALDRIG her. Det var
                netop tre hardkodede steder der stod med den gamle pris efter en
                ændring (CLAUDE.md, "Pris — REGLERNE"). */}
            <div className="ny-pris">
              <div className="ny-priskort">
                <span className="ny-prisnavn">Måned</span>
                <b>{priceText.monthly}</b>
                <small>ekskl. moms</small>
                <Link href={funnel} className="ny-btn ny-btn-ghost ny-bred">Find opgaver nu</Link>
              </div>
              <div className="ny-priskort ny-fremhaev">
                <span className="ny-prisnavn">År <i>{priceText.saveShort}</i></span>
                <b>{priceText.yearly}</b>
                <small>ekskl. moms · {YEARLY_SAVING.amount.toLocaleString("da-DK")} kr. sparet</small>
                <Link href={funnel} className="ny-btn ny-btn-teal ny-bred">Find opgaver nu</Link>
              </div>
            </div>

            <aside className="ny-garantikort">
              <b>Birdly virker. Derfor giver vi matchgaranti.</b>
              <p>Finder vi ikke et match til dig, koster det dig ikke en krone. Så enkelt er det.</p>
              <ul>
                <li><span className="ny-v">✓</span> Gratis de første {TRIAL_DAYS} dage</li>
                <li><span className="ny-v">✓</span> Ingen binding</li>
                <li><span className="ny-v">✓</span> Sig op når som helst</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------------- ANMELDELSER (skjult) ----------------
          Strukturen står klar, men sektionen renderer IKKE før VIS_ANMELDELSER er
          true OG der ligger ægte udtalelser i ANMELDELSER. Se noten ved konstanten:
          et pladsholder-citat på en live side er løgn, ikke et designelement. */}
      {VIS_ANMELDELSER && ANMELDELSER.length > 0 && (
        <section className="ny-sek">
          <div className="ny-wrap">
            <span className="ny-kick">Kunder</span>
            <h2 className="ny-big">Hvad siger de der bruger Birdly?</h2>
            <div className="ny-anm">
              {ANMELDELSER.map((a, i) => (
                <figure className="ny-anmkort" key={i}>
                  <blockquote>{a.citat}</blockquote>
                  <figcaption><b>{a.navn}</b><span>{a.firma}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- FAQ — KUN DE FIRE ----------------
          ⚠️ De fire, ikke alle tolv. Salgssiden har ét job: fjerne den tvivl der
          står mellem kunden og et klik. De fire er valgt på købstvivl — pris,
          binding, hvordan man får opgaverne, og om man kun får det man kan bruge.
          De øvrige otte er nysgerrighed, og de bor på forsiden, hvor de kan
          rangere; her ville de bare skubbe CTA'en længere ned.

          Alle fire står UDFOLDET. En købstvivl der kræver et klik for at blive
          besvaret, er ikke besvaret.

          ⚠️ Svarene læses fra lib/faq.js — samme kilde som forsidens tolv. Skrev
          vi dem af, ville de to sæt langsomt komme til at sige noget forskelligt
          om pris og opsigelse, og kunden ville opdage det på det værste tidspunkt. */}
      <section className="ny-sek ny-graa" id="faq">
        <div className="ny-wrap">
          <span className="ny-kick">Spørgsmål</span>
          <h2 className="ny-big">Det, du tænker lige nu.</h2>

          <div className="ny-faqtop">
            {FAQ_TOP.map((f) => (
              <div className="ny-faqkort" key={f.sp}>
                <h3>{f.sp}</h3>
                <p>{f.svar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- AFSLUTTENDE CTA ---------------- */}
      <section className="ny-band">
        <div className="ny-wrap">
          <h2>Klar til at fange din næste opgave?</h2>
          <p>Fortæl os hvad I laver. Så holder vi øje for jer.</p>
          <Link href={funnel} className="ny-btn ny-btn-hvid">Find opgaver nu</Link>
          <p className="ny-band-garanti">Matchgaranti: Får du ingen match, betaler du ikke en krone.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
