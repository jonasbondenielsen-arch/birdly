import Link from "next/link";
import Cta, { CtaSekundaer } from "./Cta";
import SmsTelefon from "./SmsTelefon";
import { Flueben, Kryds, Oeje, Bunke, Ur } from "./Ikoner";
import { daTal, fmtOpdateret } from "../../lib/opgaveTal";
import { PLAN, priceText, YEARLY_SAVING, TRIAL_DAYS } from "../../lib/pakke";
import { GARANTI, GARANTI_LINK, TRUST, VAERDI_ANKER, VAERDI_UNDER, EJER_LINJE } from "../../lib/salgTekst";
import { FAQ_SALG } from "../../lib/faq";

// ============================================================================
// DE 13 SEKTIONER. Rækkefølgen bor i den side der bruger dem — her bor kun
// indholdet, så /kom-i-gang, forsiden og de tre støttesider kan sætte dem
// sammen forskelligt uden at copy'en kan komme til at drive fra hinanden.
//
// ARKITEKTUREN (Hyros' konverterings-logik, ikke deres udseende):
//   RESULTAT → RISIKO FJERNET → MOTOR → BEVIS → RESULTAT IGEN
// og undervejs, gentagne gange: hvad kunden vil have → hvorfor hun måske ikke
// får det → hvorfor Birdly løser det → bevis → hvorfor prisen er lille → CTA.
//
// ⚠️ SÆLG RESULTATET, IKKE SOFTWAREN. Ingen sektion herunder må lede med
// udbudsovervågning, CPV-koder, AI, API'er, databaser eller dashboards. Kunden
// vil have flere relevante opgaver uden selv at lede; alt andet er vores
// arbejde, ikke hendes gevinst.
//
// ⚠️ ALLE BELØB KOMMER FRA lib/pakke.js OG AL GARANTI-TEKST FRA lib/salgTekst.js.
// Hardkod aldrig et tal eller en garanti-sætning her — det var netop spredningen
// der lod tre steder stå med den gamle pris og to steder med hver sin garanti.
// ============================================================================

// ---------------------------------------------------------------- hjælpere

function TrustRaekke({ mork = false }) {
  return (
    <ul className="sg-trust">
      {TRUST.map((t) => (
        <li key={t}>
          <Flueben farve={mork ? "#2EB7FF" : "#00B3A6"} size={17} /> {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * Garantien med sit forbehold. ⚠️ DE TO HØRER SAMMEN OG MÅ IKKE SKILLES AD.
 * Løftet uden forbeholdet er mere generøst end handelsbetingelserne §3.3-3.6,
 * og et markedsføringsløfte der rækker længere end aftalen er noget kunden kan
 * holde os op på. Derfor er de i samme komponent frem for to strenge man kan
 * komme til at bruge hver for sig.
 */
export function GarantiFin({ klasse = "sg-fin" }) {
  return (
    <p className={klasse}>
      {GARANTI.forbehold}{" "}
      <a href={GARANTI_LINK} target="_blank" rel="noreferrer">{GARANTI.linkTekst}</a>
    </p>
  );
}

// ------------------------------------------------------------ 1 · RESULTAT

export function Hero({ funnelHref, overskrift, under, eyebrow = "OPGAVER TIL DANSKE VIRKSOMHEDER" }) {
  return (
    <section className="sg-hero">
      <div className="sg-wrap sg-herogrid">
        <div>
          <span className="sg-pill">{eyebrow}</span>
          {/* ⚠️ H1 BÆRER RESULTATET, IKKE SØGEORDET. Søgeordene ("offentlige
              opgaver", "SMS") står i title, description og i underteksten lige
              herunder — så salgs-copy'en ikke koster placeringer. Anden linje er
              løftets følelsesmæssige halvdel og skal bære visuelt. */}
          <h1>
            {overskrift || <>Få flere relevante opgaver.</>}
            <span className="sg-em">Uden selv at lede.</span>
          </h1>
          <p className="sg-lead">
            {under || (
              <>
                Birdly finder offentlige og private opgaver, der passer til din virksomhed —
                og sender nye match direkte på SMS og mail.
              </>
            )}
          </p>
          <div className="sg-cta-row">
            <Cta href={funnelHref} placering="hero" stor />
            <CtaSekundaer href="/sadan-virker-det" placering="hero-sekundaer" />
          </div>
          <TrustRaekke />
        </div>
        <div>
          <SmsTelefon />
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------- 2 · BEVIS-BJÆLKE

/**
 * Bevis lige efter løftet. ⚠️ HVERT TAL ER ÆGTE OG KOMMER FRA get-opgave-tal.
 * Mangler et felt, renderes cellen ikke — vi hardkoder ALDRIG et live-agtigt tal,
 * og et gæt på forsiden er værre end en celle mindre. Er der slet ingen data,
 * renderer hele bjælken sig væk frem for at stå tom.
 *
 * "2× opdatering dagligt" er den ene faste celle: den beskriver ingest-kadencen,
 * ikke en måling, og den står allerede på /kom-i-gang i dag.
 */
export function BevisBjaelke({ tal }) {
  const bydbare = typeof tal?.bydbare === "number" ? tal.bydbare : null;
  const aabne = typeof tal?.bydbare_aabne === "number" ? tal.bydbare_aabne : null;
  const nye = typeof tal?.nye_7_dage === "number" ? tal.nye_7_dage : null;
  const opdateret = fmtOpdateret(tal?.sidst_opdateret);

  if (bydbare == null && aabne == null && nye == null) return null;

  return (
    <section className="sg-bevis">
      <div className="sg-wrap">
        <div className="sg-bevis-h">
          <span className="sg-prik" aria-hidden="true" /> Birdly arbejder allerede
        </div>
        <div className="sg-bevis-grid">
          {aabne != null && (
            <div className="sg-bevis-celle">
              <div className="sg-tal">{daTal(aabne)}</div>
              <small>opgaver med åben frist lige nu</small>
            </div>
          )}
          {bydbare != null && (
            <div className="sg-bevis-celle">
              <div className="sg-tal">{daTal(bydbare)}</div>
              <small>opgaver vi holder øje med</small>
            </div>
          )}
          {nye != null && (
            <div className="sg-bevis-celle">
              <div className="sg-tal">{daTal(nye)}</div>
              <small>nye de sidste 7 dage</small>
            </div>
          )}
          <div className="sg-bevis-celle">
            <div className="sg-tal">2×</div>
            {/* ⚠️ Tidspunktet er hentetidspunktet fra sidste gennemførte kørsel —
                ALDRIG new Date(). En klokke der viser "nu" beviser ingenting om
                hvornår vi sidst hentede; den ville stå og lyve friskhed. */}
            <small>opdatering dagligt{opdateret ? <><br />Sidst opdateret {opdateret}</> : null}</small>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------- 3 · RISIKO FJERNET

export function RisikoFjernet({ funnelHref }) {
  return (
    <section className="sg-sek sg-blaa" id="risiko">
      <div className="sg-wrap">
        <div className="sg-risiko-kort">
          <span className="sg-kick">Prøv det uden risiko</span>
          {/* ⚠️ BETINGET ORDLYD, FRA lib/salgTekst.js. Her stod tidligere "Ingen
              relevante match? Så betaler du ikke." — ubetinget, mens
              handelsbetingelserne §3.3-3.6 sætter tre rammer. Garantien skal stå
              HER, i fuldt lys, ikke gemt nede i FAQ'en. */}
          <h2>{GARANTI.overskrift}</h2>
          <p className="sg-lead" style={{ margin: "16px auto 0" }}>
            Prøv Birdly gratis i {TRIAL_DAYS} dage. Du betaler 0 kr. i dag, og du kan sige
            op når som helst.
          </p>
          <GarantiFin />

          <div className="sg-fire">
            <div className="sg-fire-item"><Flueben size={18} /> {TRIAL_DAYS} dage gratis</div>
            <div className="sg-fire-item"><Flueben size={18} /> Ingen binding</div>
            <div className="sg-fire-item"><Flueben size={18} /> Ingen portal</div>
            <div className="sg-fire-item"><Flueben size={18} /> Opsætning på få minutter</div>
          </div>

          <div className="sg-cta-row" style={{ justifyContent: "center" }}>
            <Cta href={funnelHref} placering="risiko" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 4 · PROBLEMET

export function Problemet() {
  return (
    <section className="sg-sek" id="problem">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Problemet</span>
          <h2 className="sg-big">Opgaverne er der.<br />Problemet er at finde de rigtige.</h2>
          <p className="sg-lead">
            Offentlige og private opgaver dukker op løbende. De ligger forskellige steder,
            og langt det meste er ikke relevant for jer.
          </p>
        </div>

        {/* ⚠️ INGEN SKRÆMMEKAMPAGNE. Tre nøgterne konstateringer om en hverdag
            kunden kender — ikke "du går glip af millioner". Overdrivelsen ville
            koste netop den troværdighed resten af siden bygger på. */}
        <div className="sg-tre">
          <div className="sg-kort">
            <div className="sg-kort-ic"><Oeje /></div>
            <h3>Du skal selv holde øje</h3>
            <p>Portaler, søgninger og nye opslag. Det kræver, at nogen sætter sig ned og kigger — hver dag.</p>
          </div>
          <div className="sg-kort">
            <div className="sg-kort-ic"><Bunke /></div>
            <h3>Det meste passer ikke</h3>
            <p>Tid brugt på at læse opgaver, I aldrig ville tage — forkert fag, forkert sted eller forkert størrelse.</p>
          </div>
          <div className="sg-kort">
            <div className="sg-kort-ic"><Ur /></div>
            <h3>Den gode opgave kan blive overset</h3>
            <p>Den dukker op midt i en travl uge, mens I passer kunder og projekter. Og så er fristen løbet.</p>
          </div>
        </div>

        <p className="sg-afslut">
          Birdly gør det modsatte: I fortæller os, hvad I vil have. Vi holder øje. I får besked.
        </p>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- 5 · MOTOREN

export function Motoren({ funnelHref }) {
  return (
    <section className="sg-sek sg-graa" id="hvordan">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Sådan virker det</span>
          <h2 className="sg-big">Du fortæller os én gang, hvad I leder efter.<br />Birdly gør resten.</h2>
        </div>

        {/* ⚠️ TRE TRIN, IKKE FIRE. Den gamle forside havde et fjerde ("Vi hjælper
            dig i mål" om bud-skabelonen). Skabelonen er ægte og god, men den er en
            BONUS efter købet — som fjerde trin i forklaringen af motoren gør den
            produktet mere kompliceret at forstå, præcis dér hvor det skal virke
            enkelt. Den bor nu i SMS-sektionen, hvor den hører til. */}
        <div className="sg-trin">
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">01</div>
            <h3>Fortæl hvad I laver</h3>
            <p>Vælg fag, område og hvor store opgaver I vil høre om. Det tager få minutter.</p>
          </div>
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">02</div>
            <h3>Birdly holder øje</h3>
            <p>Vi finder relevante offentlige og private muligheder — og sorterer resten fra.</p>
          </div>
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">03</div>
            <h3>Få besked</h3>
            <p>Direkte på SMS og mail, når der er noget, der passer til jer.</p>
          </div>
        </div>

        <div className="sg-flow" aria-hidden="true">
          <span className="sg-flow-node">Jeres kriterier</span>
          <span className="sg-flow-pil">→</span>
          <span className="sg-flow-node sg-flow-midt">Birdly holder øje</span>
          <span className="sg-flow-pil">→</span>
          <span className="sg-flow-node">SMS til jer</span>
        </div>

        <p className="sg-afslut">Ingen daglig søgning. Ingen portal. Ingen støj.</p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="motor" />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 7 · SMS-DEMO

export function SmsDemo() {
  return (
    <section className="sg-sek">
      <div className="sg-wrap sg-demogrid">
        <div>
          <SmsTelefon
            titel="Nyt Birdly-match"
            fag="Fast rengøring"
            sted="Roskilde Kommune"
            hvad="Rengøring af administrationsbygninger"
            frist="18/09"
          />
        </div>
        <div>
          <span className="sg-kick">Beskeden</span>
          <h2 className="sg-big">Det er ikke mere kompliceret end det her.</h2>
          <ul className="sg-punkter">
            <li><Flueben size={20} /> Tre linjers resumé af opgaven</li>
            <li><Flueben size={20} /> Fristen, så I ved hvor hurtigt der skal handles</li>
            <li><Flueben size={20} /> Link direkte til opgaven — intet login</li>
            <li><Flueben size={20} /> Bud-skabelon, hvor den er relevant</li>
          </ul>
          <p className="sg-lead">
            Vi pakker det bøvlede væk. I får det, I skal bruge for at vurdere, om opgaven er
            interessant — og ikke mere end det.
          </p>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- 8 · VÆRDI

export function Vaerdi({ funnelHref }) {
  return (
    <section className="sg-sek sg-graa" id="vaerdi">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Regnestykket</span>
          <h2 className="sg-big">Hvad er én god opgave værd for jer?</h2>
          {/* ⚠️ yearlyBare, ikke yearlyLong: "4.990 kr. om året … for et helt år"
              sagde det samme to gange i én sætning. */}
          <p className="sg-lead">Birdly koster {priceText.yearlyBare} ekskl. moms for et helt år.</p>
        </div>

        <div className="sg-vaerdi">
          <div className="sg-vaerdi-boks">
            <div className="sg-tal">365 dage</div>
            <small>holder Birdly øje for jer</small>
          </div>
          <div className="sg-vaerdi-vs" aria-hidden="true">mod</div>
          <div className="sg-vaerdi-boks sg-pris-side">
            {/* Beløbet fra pakke.js, aldrig skrevet i hånden. */}
            <div className="sg-tal">{priceText.yearlyBare}</div>
            <small>ekskl. moms — for hele året</small>
          </div>
        </div>

        {/* ⚠️ BETINGET. "Kan betale … mange gange hjem", aldrig "du tjener pengene
            hjem". Vi lover ikke at kunden vinder en opgave, og vi sætter ikke tal
            på en kontraktværdi. Sætningen bor i lib/salgTekst.js netop for at den
            ikke kan blive skærpet ét sted uden at nogen opdager det. */}
        <p className="sg-anker">{VAERDI_ANKER}</p>
        <p className="sg-afslut" style={{ marginTop: 10 }}>Og I behøver ikke selv sidde og lede efter den.</p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="vaerdi" />
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------- 9 · KUNDEBEVIS

// ⚠️ SLÅET FRA, OG DET ER IKKE EN FORGLEMMELSE (bekræftet af Jonas 06-09-2026).
// Der findes ingen ægte, godkendte udtalelser i huset endnu. Et pladsholder-citat
// der ser ægte ud på en live side er både løgn over for kunden og i strid med
// markedsføringsloven — og et opdigtet "1 match → kontrakt på XXX.XXX kr." er
// den værste af slagsen, fordi den er præcis det bevis en køber leder efter.
//
// Sæt VIS_KUNDEBEVIS til true FØRST når der ligger rigtige udtalelser med navn,
// firma og skriftligt samtykke — og læg dem i KUNDEBEVIS. Er der kun to gode,
// så vis to. Færre ægte punkter slår flere falske hver eneste gang.
//
// Indsamlingen kører allerede: FeedbackKort3 spørger om lov ("Birdly må dele min
// anmeldelse") og gemmer svaret i feedback_svar i birdly-admin. Der findes bare
// intet offentligt endpoint der henter de godkendte ud — det er en separat opgave
// i det andet repo.
const VIS_KUNDEBEVIS = false;
const KUNDEBEVIS = []; // { citat, navn, firma }

export function Kundebevis() {
  if (!VIS_KUNDEBEVIS || KUNDEBEVIS.length === 0) return null;
  return (
    <section className="sg-sek">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Kunder</span>
          <h2 className="sg-big">Resultater slår salgssnak.</h2>
        </div>
        <div className="sg-tre">
          {KUNDEBEVIS.map((a, i) => (
            <figure className="sg-kort" key={i}>
              <blockquote style={{ fontSize: "16.5px", lineHeight: 1.6 }}>{a.citat}</blockquote>
              <figcaption style={{ marginTop: 14, fontSize: 14.5, color: "var(--navy-soft)" }}>
                <b style={{ color: "var(--navy)" }}>{a.navn}</b> · {a.firma}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------- 10 · IKKE EN PORTAL

export function IkkePortal() {
  return (
    <section className="sg-sek">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Forskellen</span>
          <h2 className="sg-big">Endnu en portal? Nej tak.</h2>
        </div>

        <div className="sg-vs">
          <div className="sg-vs-kort sg-vs-gammel">
            <h3>En almindelig udbudstjeneste</h3>
            <ul className="sg-vs-liste">
              <li><Kryds /> Log ind</li>
              <li><Kryds /> Søg</li>
              <li><Kryds /> Sæt filtre op</li>
              <li><Kryds /> Åbn opgaverne én for én</li>
              <li><Kryds /> Læs og frasortér</li>
              <li><Kryds /> Gentag i morgen</li>
            </ul>
          </div>
          <div className="sg-vs-kort sg-vs-ny">
            <h3>Birdly</h3>
            <ul className="sg-vs-liste">
              <li><Flueben size={18} /> Vælg jeres kriterier én gang</li>
              <li><Flueben size={18} /> Modtag relevante match på SMS og mail</li>
            </ul>
            <p className="sg-fin" style={{ marginTop: 20 }}>{EJER_LINJE}</p>
          </div>
        </div>

        <p className="sg-afslut">
          Birdly er ikke lavet til at give jer mere software. Det er lavet til at give jer
          relevante opgaver.
        </p>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- 11 · PRISER

export function Priser({ funnelHref, medOverskrift = true }) {
  // Kr./md. ved årsbetaling. ⚠️ REGNET, IKKE SKREVET: 4.990 / 12 = 415,83 →
  // "ca. 416 kr./md.". Et håndskrevet tal her ville stå forkert dagen efter en
  // prisændring, uden at nogen opdagede det.
  const prMaaned = Math.round(PLAN.yearly / 12).toLocaleString("da-DK");

  return (
    <section className="sg-sek sg-graa" id="priser">
      <div className="sg-wrap">
        {medOverskrift && (
          <div className="sg-midt">
            <span className="sg-kick">Én pakke. Alt inkluderet.</span>
            <h2 className="sg-big">Prøv gratis. Behold Birdly, hvis det giver mening.</h2>
          </div>
        )}

        <div className="sg-planer">
          {/* ⚠️ MÅNED SKJULES ALDRIG. År fremhæves, fordi det er det bedste tilbud
              og fordi funnelen har det som forvalg — men en kunde der vil betale
              månedligt skal kunne se at hun må, uden at lede. Skjult månedspris
              er den slags der bliver opdaget i checkouten og koster tilliden. */}
          <div className="sg-plan">
            <span className="sg-plan-navn">Måned</span>
            <div className="sg-pris-beloeb">{priceText.monthly}</div>
            <small>ekskl. moms</small>
            <ul className="sg-plan-liste">
              <li><Flueben size={17} /> {TRIAL_DAYS} dage gratis</li>
              <li><Flueben size={17} /> Ingen binding</li>
              <li><Flueben size={17} /> Alt indhold inkluderet</li>
            </ul>
            <Cta href={funnelHref} placering="priser-maaned" variant="ghost" bred />
          </div>

          <div className="sg-plan sg-plan-frem">
            <span className="sg-plan-badge">Mest valgte</span>
            <span className="sg-plan-navn">År</span>
            <div className="sg-pris-beloeb">{priceText.yearly}</div>
            <small>ekskl. moms</small>
            {/* "Betal for 10 måneder — få 12" er bogstaveligt sandt: 4.990 ÷ 499
                er præcis 10. Besparelsen kommer fra YEARLY_SAVING. */}
            <div className="sg-plan-spar">
              Betal for 10 måneder — få 12. Spar {YEARLY_SAVING.amount.toLocaleString("da-DK")} kr.
            </div>
            <div className="sg-plan-md">Det svarer til ca. {prMaaned} kr./md.</div>
            <ul className="sg-plan-liste">
              <li><Flueben size={17} /> {TRIAL_DAYS} dage gratis</li>
              <li><Flueben size={17} /> Samme indhold som månedsplanen</li>
              <li><Flueben size={17} /> Ét træk om året</li>
            </ul>
            <Cta href={funnelHref} placering="priser-aar" bred />
          </div>
        </div>

        <p className="sg-anker">{VAERDI_ANKER}</p>
        <p className="sg-afslut" style={{ marginTop: 8 }}>{VAERDI_UNDER}</p>

        <div style={{ maxWidth: 620, margin: "24px auto 0", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "var(--navy)", fontWeight: 600 }}>
            {GARANTI.overskrift}
          </p>
          <GarantiFin />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ 12 · RESULTAT IGEN

export function SlutCta({ funnelHref }) {
  return (
    <section className="sg-navy sg-slut">
      <div className="sg-wrap">
        <h2>Den næste relevante opgave findes måske allerede.</h2>
        <p>Birdly sørger for, at I ser den.</p>
        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="slut" variant="hvid" stor />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TrustRaekke mork />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 13 · FAQ

/**
 * Konverterings-FAQ: indvendinger først, pris og betaling til sidst.
 *
 * ⚠️ INGEN VIGTIG SALGSINFO GEMMES HER. Garantien, prisen og prøveperioden står
 * alle sammen i fuldt lys længere oppe; FAQ'en gentager dem for den der leder
 * efter detaljen, den bærer dem ikke. En køber der skal folde en boks ud for at
 * finde ud af hvad tjenesten koster, folder den ikke ud — hun lukker fanen.
 *
 * Svarene læses fra lib/faq.js, samme kilde som rodens tolv. Kopieret ville de to
 * sæt langsomt sige noget forskelligt om pris og opsigelse.
 */
export function SalgFaq({ funnelHref }) {
  return (
    <section className="sg-sek" id="faq">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Spørgsmål</span>
          <h2 className="sg-big">Det, du tænker lige nu.</h2>
        </div>

        <div className="sg-faq">
          {FAQ_SALG.map((f) => (
            <details key={f.sp}>
              <summary>{f.sp}<span className="sg-pm" aria-hidden="true">+</span></summary>
              <div className="sg-faq-svar">{f.svar}</div>
            </details>
          ))}
        </div>

        {funnelHref && (
          <div className="sg-cta-row" style={{ justifyContent: "center" }}>
            <Cta href={funnelHref} placering="faq" />
          </div>
        )}
      </div>
    </section>
  );
}

// ------------------------------------------------- efterspørgsel (adskilt)

/**
 * "Har du en opgave?" — den ANDEN side af markedspladsen.
 *
 * ⚠️ ALDRIG INDE I B2B-FLOWET. Den stod før som et bånd midt på forsiden, mellem
 * løftet og problemet. To ting gik galt: en håndværker der klikkede, landede i en
 * formular hvor han skulle beskrive et arbejde han gerne ville UDFØRE, og en
 * husejer der klikkede på "Find opgaver nu" landede i et CVR-felt. Derfor bor
 * indgangen nu i headeren og her nederst — efter at B2B-flowet er færdigt — og
 * aldrig som en sektion der bryder salgsrækkefølgen.
 */
export function EfterspoergselsLink() {
  return (
    <section className="sg-sek-taet" style={{ borderTop: "1px solid var(--line)" }}>
      <div className="sg-wrap sg-midt">
        <p className="sg-fin" style={{ marginTop: 0, fontSize: "15px" }}>
          Er du privat og har en opgave, der skal laves?{" "}
          <Link href="/opret-opgave" style={{ color: "var(--sky)", fontWeight: 600, textDecoration: "underline" }}>
            Opret den gratis her
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
