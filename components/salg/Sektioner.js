import Link from "next/link";
import Cta, { CtaSekundaer } from "./Cta";
import SmsTelefon from "./SmsTelefon";
import FaqListe from "./FaqListe";
import { Flueben, Kryds, Oeje, Bunke, Ur } from "./Ikoner";
import { tekster, t } from "../../lib/tekster";
import { MARKEDER } from "../../lib/markets";
import { daTal, fmtOpdateret } from "../../lib/opgaveTal";
import { PLAN, priceText, YEARLY_SAVING, TRIAL_DAYS } from "../../lib/pakke";
import {
  CTA, GARANTI, GARANTI_LINK, TRUST, VAERDI_ANKER, EJER_LINJE,
  VIND_EN, STOERRELSE_LINJE, OFFENTLIGE, SMS_LINJE, SMS_UNDER, IKKE_HOLDE_OEJE,
} from "../../lib/salgTekst";
import { byggAnker, BETINGET_LINJE, FORBEHOLD } from "../../lib/vaerdiAnker";

// ============================================================================
// DE 13 SEKTIONER. Rækkefølgen bor i den side der bruger dem — her bor kun
// indholdet, så /kom-i-gang, forsiden og de tre støttesider kan sætte dem
// sammen forskelligt uden at copy'en kan komme til at drive fra hinanden.
//
// ARKITEKTUREN:
//   RESULTAT → PROBLEM → BEVIS → MOTOR → ØKONOMISK VÆRDI → RISIKO → TILBUD → CTA
//
// ⚠️ SÆLG RESULTATET, IKKE SOFTWAREN. Ingen sektion herunder må lede med
// udbudsovervågning, CPV-koder, AI, API'er, databaser eller dashboards.
//
// ⚠️ ALLE BELØB KOMMER FRA lib/pakke.js, AL GARANTI-TEKST FRA lib/salgTekst.js
// OG ALLE FORHOLDSTAL FRA lib/vaerdiAnker.js. Hardkod aldrig et tal eller en
// garanti-sætning her.
//
// ⚠️ BIRDLY GARANTERER ALDRIG EN VUNDET OPGAVE. Værdi-sektionen sammenligner en
// kontraktværdi med en abonnementspris — den lover ikke et afkast. Læs reglen i
// lib/vaerdiAnker.js før du rører én sætning dér.
// ============================================================================

// ---------------------------------------------------------------- hjælpere

/**
 * Husets egen konstant for Danmark — ordbogen for alle andre markeder.
 *
 * ⚠️ DANMARK MÅ IKKE GÅ GENNEM ORDBOGEN HER. `salgTekst.js` og
 * `vaerdiAnker.js` ER husets kilder; CLAUDE.md siger det rent ud: al
 * garanti-tekst og alle forholdstal kommer derfra, og intet hardkodes i en
 * sektion. Lagde jeg DK's ordlyd om til et ordbogsopslag, ville hver sætning
 * afhænge af at TO strenge blev holdt ens — og de ville kunne skride fra
 * hinanden uden at nogen så det. Med den her funktion er DK bogstaveligt talt
 * det samme udtryk som før.
 *
 * ⚠️ ET ANDET MARKED FALDER IKKE TILBAGE TIL DANSK. Mangler nøglen, kommer der
 * `null` ud, og afsnittet udelades — samme regel som lib/tekster/index.js. En
 * dansk sætning på en britisk side er værre end en manglende: den ser ud som
 * om den hører til.
 */
function hus(marked, husets, sti) {
  return marked === "DK" ? husets : t(marked, sti);
}

/**
 * Markedets pris-tekster — REGNET, ikke skrevet.
 *
 * ⚠️ DANMARK RØRES IKKE. DK's beløb kommer fortsat fra lib/pakke.js, som er
 * husets enekilde og bundet til Frisbii. Den her funktion kaldes kun for
 * ANDRE markeder, og den regner det samme som pakke.js gør for DK:
 * månedsækvivalent, besparelse og hvor mange måneder året svarer til.
 *
 * ⚠️ LOKAL FUNKTION, IKKE EN NY EKSPORT. En ny eksport i et delt modul er
 * ikke gratis her: 09-09-2026 flyttede netop det DK-forsidens bytes, fordi
 * bundleren grupperede chunks anderledes. Se noten i app/uk/page.js.
 *
 * ⚠️ ALDRIG KURS-KONVERTERET. £59/£590 er Jonas' beslutning, ikke 499 kr.
 * omregnet — se lib/markets.js.
 */
function prisFor(marked) {
  const p = MARKEDER[marked]?.pris;
  if (!p) return null;
  const sym = MARKEDER[marked].valutaSymbol;
  const maanedsTotal = p.maaned * 12;
  const spar = maanedsTotal - p.aar;
  return {
    aar: `${sym}${p.aar}/year`,
    maaned: `${sym}${p.maaned}/month`,
    // Regnet: 590/12 = 49,17 → "around £49/month".
    prMaaned: `${sym}${Math.round(p.aar / 12)}/month`,
    spar: `${sym}${spar}`,
    // Betal for N måneder, få 12. 590/59 = 10 præcis.
    maanederBetalt: Math.round(p.aar / p.maaned),
    proeveDage: p.proeveDage,
  };
}

/**
 * CTA-knappens tekst som PROPS — og INTET for Danmark.
 *
 * ⚠️ DEN HER FUNKTION FINDES FOR AT DK IKKE SKAL FLYTTE SIG. Cta er en
 * klient-komponent, og hver prop den får, bliver skrevet ind i RSC-strømmen.
 * `marked={marked}` lagde altså "marked":"DK" ind i hver eneste danske side —
 * målt 09-09-2026 på forsiden, /hvorfor-birdly og /kom-i-gang. Prop'ens værdi
 * var korrekt; problemet var at den overhovedet var der.
 *
 * Returnerer `null` for DK, så `{...ctaTekst("DK", "primaer")}` spreder
 * ingenting og knappen får nøjagtig de props den fik før ordbogen fandtes.
 *
 * ⚠️ OPSLAGET SKER HER, PÅ SERVEREN. Cta må ikke selv læse ordbogen — så
 * havner både den danske og den engelske ordbog i klient-bundtet på danske
 * sider. Se den fulde note i Cta.js.
 */
function ctaTekst(marked, noegle) {
  if (marked === "DK") return null;
  return { tekst: tekster(marked)?.cta?.[noegle] ?? CTA[noegle] };
}

function TrustRaekke({ mork = false, marked = "DK" }) {
  // DK bruger husets TRUST fra salgTekst.js UAENDRET; andre markeder har deres
  // egen raekke i ordbogen. Der oversaettes ikke i koden.
  const raekke = marked === "DK" ? TRUST : (tekster(marked).trust || TRUST);
  return (
    <ul className="sg-trust">
      {raekke.map((t) => (
        <li key={t}>
          <Flueben farve={mork ? "#2EB7FF" : "#00B3A6"} size={17} /> {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * Garantiens præcise mekanik med link til den fulde ordlyd.
 *
 * ⚠️ DEN SKAL FØLGE MED HVER GANG GARANTI-OVERSKRIFTEN VISES. Overskriften siger
 * "14 dage gratis. Ingen relevante match? Så betaler du ikke." — uden den her
 * linje står der ikke nogen steder at garantien løber 60 dage og handler om
 * REFUSION, ikke om en fire gange længere prøveperiode. Se noten i
 * lib/salgTekst.js: det er den letteste og dyreste fejl at lave her.
 */
export function GarantiFin({ klasse = "sg-fin", marked = "DK" }) {
  // ⚠️ DANMARKS GARANTI-TEKST KOMMER FORTSAT FRA salgTekst.js, UROERT.
  // CLAUDE.md: al garanti-tekst har EEN kilde. En kopi i ordbogen ville vaere
  // et andet sted den kunne komme til at staa anderledes - og netop den
  // saetning er den dyreste at tage fejl af.
  //
  // ⚠️ GB's UDGAVE ER COPY-FILENS EGEN "Working marketing version" (§4).
  // Den er MED efter Jonas' beslutning 09-09-2026: garantien er et rigtigt
  // UK-loefte, praecis som DK, og er ikke gated paa faerdig jura.
  // ⚠️ LINKET peger paa en britisk betingelses-side der endnu er DRAFT. Teksten
  // maa vises, men den skal kunne slaas op - se pre-live-tjeklisten.
  const praecis = hus(marked, GARANTI.praecis, "risiko.garantiPraecis");
  const forbehold = hus(marked, GARANTI.forbehold, "risiko.garantiForbehold");
  const linkTekst = hus(marked, GARANTI.linkTekst, "risiko.garantiLink");
  if (!praecis) return null;
  return (
    <p className={klasse}>
      {praecis} {forbehold}{" "}
      <a href={GARANTI_LINK} target="_blank" rel="noreferrer">{linkTekst}</a>
    </p>
  );
}

// ------------------------------------------------------------ 1 · RESULTAT

// ⚠️ GENKENDELSES-CHIPS, IKKE NAVIGATION. De er ikke links, og de skal ikke
// klikkes på. Deres eneste job er at en rengørings- eller serviceejer på under
// tre sekunder ser ord fra sin egen hverdag og tænker "det her er til
// virksomheder som min" — før hun overhovedet har læst underteksten.
//
// ⚠️ ALLE FEM ER TING BIRDLY FAKTISK MATCHER PÅ. De er ikke pyntede kategorier:
// de ligger under rengørings- og service-fagene i kataloget. Skriver vi et
// område her som motoren ikke dækker, er chippen et løfte vi ikke kan holde.
//
// ⚠️ SELVE LISTEN BOR I ORDBOGEN (lib/tekster/*.js → hero.chips). Den stod
// også her som `HERO_CHIPS` indtil 09-09-2026, men blev ikke længere læst —
// en efterladt kopi af de fem danske chips er præcis den drift ordbogen
// findes for at forhindre.

export function Hero({
  funnelHref,
  overskrift,
  under,
  eyebrow,
  chips,
  sekundaerHref = "/sadan-virker-det",
  // ⚠️ MARKEDET ER EN PROP MED DK SOM DEFAULT. Laeste komponenten selv
  // headers(), ville forsiden blive DYNAMISK og miste sin cache - og DK's
  // statiske forside er praecis det der ikke maa roeres. Den danske rute
  // sender ingenting, faar DK-ordbogen, og renderer noejagtig som foer.
  marked = "DK",
}) {
  const T = tekster(marked).hero;
  eyebrow = eyebrow ?? T.eyebrow;
  chips = chips ?? T.chips;
  return (
    <section className="sg-hero">
      <div className="sg-wrap sg-herogrid">
        <div>
          <span className="sg-pill">{eyebrow}</span>
          {/* ⚠️ H1 LEDER PÅ MÅLGRUPPEN, IKKE PÅ SØGEORDET (06-09-2026).
              Birdly dækker stadig 20 fag, men den kommercielle prioritet er
              rengøring og service, og en generisk overskrift tvang netop den
              målgruppe til selv at oversætte "relevante opgaver" til deres egen
              hverdag. Søgeordene ("offentlige og private opgaver", "SMS") står
              stadig i title, description og i underteksten lige herunder.
              ⚠️ SE NOTEN I RAPPORTEN: på roden (/) er det her et bevidst valg om
              at snævre H1 ind på en side der også rangerer på brede termer.
              Skal det rulles tilbage, er det ÉN prop: `overskrift`. */}
          <h1>
            {/* ⚠️ HÅRD MELLEMRUM EFTER BINDESTREGEN. Uden den brækkede linjen
                efter "rengørings-", og en bindestreg i slutningen af en linje
                læses som et delt ord — ikke som den korrekte danske
                sammentrækning "rengørings- og serviceopgaver". */}
            {overskrift || T.overskrift}
            <span className="sg-em">{T.overskriftEm}</span>
          </h1>
          {/* ⚠️ ÉN SÆTNING, OG DER MÅ IKKE KOMME MERE. Hero'en skal forstås på
              under fem sekunder; hver ekstra linje her koster af den tid. */}
          <p className="sg-lead">
            {under || T.under}
          </p>

          {chips?.length > 0 && (
            <ul className="sg-chips" aria-label={T.chipsLabel}>
              {chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
          )}

          <div className="sg-cta-row">
            {/* ⚠️ CTA'EN BLIVER "FIND OPGAVER NU" — også på en rengørings-hero.
                Birdly dækker 20 fag, og huset har ÉN primær CTA. En
                fag-specifik knap ville splitte det genkendelige klik op i lige
                så mange varianter som vi har fag. */}
            <Cta href={funnelHref} placering="hero" stor {...ctaTekst(marked, "primaer")} />
            {/* ⚠️ SEKUNDÆRENS MÅL ER EN PROP, FORDI /sadan-virker-det ER EN
                DANSK SIDE. Uden den ville den britiske hero have sendt en
                britisk besøgende til dansk tekst — et dødt spor midt i
                løftet. DK's default er uændret. */}
            <CtaSekundaer href={sekundaerHref} placering="hero-sekundaer" {...ctaTekst(marked, "sekundaer")} />
          </div>
          <TrustRaekke marked={marked} />
        </div>
        <div>
          {/* ⚠️ MARKEDET SKAL MED HERTIL. Uden det stod telefonen på dansk midt
              i den britiske hero — se noten i SmsTelefon.js. */}
          <SmsTelefon marked={marked} />
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------- 2 · BEVIS-BJÆLKE

/**
 * Bevis lige efter løftet. ⚠️ HVERT TAL ER ÆGTE OG KOMMER FRA get-opgave-tal.
 * Mangler et felt, renderes cellen ikke; er der ingen data, renderer hele
 * bjælken sig væk. Vi hardkoder ALDRIG et live-agtigt tal.
 *
 * ⚠️ DEN MÅ IKKE KONKURRERE MED HERO'EN. Overskriften "BIRDLY ARBEJDER ALLEREDE"
 * er det første øjet skal fange — tallene er dokumentationen bagefter, ikke
 * sidens hovedbudskab. Derfor er de mindre end H1 og bjælken er lav.
 */
export function BevisBjaelke({ tal, marked = "DK" }) {
  const T = tekster(marked).bevis;
  const bydbare = typeof tal?.bydbare === "number" ? tal.bydbare : null;
  const aabne = typeof tal?.bydbare_aabne === "number" ? tal.bydbare_aabne : null;
  const nye = typeof tal?.nye_7_dage === "number" ? tal.nye_7_dage : null;
  const opdateret = fmtOpdateret(tal?.sidst_opdateret);

  if (bydbare == null && aabne == null && nye == null) return null;

  return (
    <section className="sg-bevis">
      <div className="sg-wrap">
        <div className="sg-bevis-h">
          <span className="sg-prik" aria-hidden="true" />{" " + T.overskrift}
        </div>
        {/* ⚠️ KORT, IKKE LØSE TAL. Tallene svævede før på hvid baggrund og lignede
            en fodnote man kunne scrolle forbi. I hver sit kort på en dæmpet
            gradient læses de som dokumentation — og det er dét de er.
            ⚠️ HVERT TAL ER STADIG ÆGTE. Mangler et felt, renderes kortet ikke. */}
        <div className="sg-bevis-grid">
          {aabne != null && (
            <div className="sg-bevis-kort">
              <div className="sg-tal">{daTal(aabne)}</div>
              <small>{T.aabne}</small>
            </div>
          )}
          {bydbare != null && (
            <div className="sg-bevis-kort">
              <div className="sg-tal">{daTal(bydbare)}</div>
              <small>{T.bydbare}</small>
            </div>
          )}
          {nye != null && (
            <div className="sg-bevis-kort">
              <div className="sg-tal">{daTal(nye)}</div>
              <small>{T.nye}</small>
            </div>
          )}
          <div className="sg-bevis-kort">
            <div className="sg-tal">{T.frekvensTal}</div>
            <small>{T.frekvens}</small>
          </div>
        </div>
        {/* ⚠️ Tidspunktet er hentetidspunktet fra sidste gennemførte ingest-kørsel
            — ALDRIG new Date(). En klokke der viser "nu" beviser ingenting om
            hvornår vi sidst hentede; den ville stå og lyve friskhed. Mangler det,
            står linjen der slet ikke. */}
        {opdateret && <p className="sg-bevis-opd">{T.opdateret + " "}{opdateret}</p>}
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 3 · PROBLEMET

export function Problemet({ marked = "DK" }) {
  const T = tekster(marked).problemet;
  return (
    <section className="sg-sek" id="problem">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">{T.kick}</span>
          <h2 className="sg-big">{T.overskrift}<br />{T.overskrift2}</h2>
        </div>

        {/* ⚠️ ÉN LINJE PR. KORT. Sektionen skal kunne læses på fem sekunder på en
            telefon; den lange version stod i vejen for beviset længere nede.
            Ingen skræmmekampagne — tre nøgterne konstateringer om en hverdag
            kunden kender. */}
        {/* ⚠️ TRE UDSKREVNE KORT, IKKE ET .map(). Hvert kort har sit EGET ikon,
            og de tre ikoner er ikke tekst — de kan ikke bo i ordbogen. Et map
            ville kræve en parallel ikon-liste, hvor rækkefølgen af tekst og
            ikon kunne skride fra hinanden uden at nogen opdagede det. Med tre
            faste kort står ikonet ved siden af sin egen tekst. */}
        <div className="sg-tre">
          <div className="sg-kort">
            <div className="sg-kort-ic"><Oeje /></div>
            <h3>{T.kort[0].titel}</h3>
            <p>{T.kort[0].tekst}</p>
          </div>
          <div className="sg-kort">
            <div className="sg-kort-ic"><Bunke /></div>
            <h3>{T.kort[1].titel}</h3>
            <p>{T.kort[1].tekst}</p>
          </div>
          <div className="sg-kort">
            <div className="sg-kort-ic"><Ur /></div>
            <h3>{T.kort[2].titel}</h3>
            <p>{T.kort[2].tekst}</p>
          </div>
        </div>

        <p className="sg-afslut">
          {T.afslut}
        </p>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- 4 · MOTOREN

export function Motoren({ funnelHref, marked = "DK" }) {
  const T = tekster(marked).motoren;
  return (
    <section className="sg-sek sg-graa" id="hvordan">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">{T.kick}</span>
          <h2 className="sg-big">{T.overskrift}<br />{T.overskrift2}</h2>
        </div>

        {/* ⚠️ TRE TRIN, IKKE FIRE, og ingen teknisk forklaring. Bud-skabelonen er
            ægte og god, men som fjerde trin gør den produktet sværere at forstå
            netop dér hvor det skal virke enkelt. Den bor i SMS-sektionen. */}
        <div className="sg-trin">
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">{T.trin[0].nr}</div>
            <h3>{T.trin[0].titel}</h3>
            <p>{T.trin[0].tekst}</p>
          </div>
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">{T.trin[1].nr}</div>
            <h3>{T.trin[1].titel}</h3>
            <p>{T.trin[1].tekst}</p>
          </div>
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">{T.trin[2].nr}</div>
            <h3>{T.trin[2].titel}</h3>
            <p>{T.trin[2].tekst}</p>
          </div>
        </div>

        {/* ⚠️ PILENE ER MARKUP, IKKE TEKST. De har deres egen klasse og er en
            del af figuren; ordbogen bærer kun de tre knuder. Hele rækken er
            aria-hidden, fordi den gentager de tre trin ovenfor visuelt. */}
        <div className="sg-flow" aria-hidden="true">
          <span className="sg-flow-node">{T.flow[0]}</span>
          <span className="sg-flow-pil">→</span>
          <span className="sg-flow-node sg-flow-midt">{T.flow[1]}</span>
          <span className="sg-flow-pil">→</span>
          <span className="sg-flow-node">{T.flow[2]}</span>
        </div>

        {/* ⚠️ EN RESULTAT-LINJE, IKKE ET FJERDE TRIN. Tre trin forklarer
            mekanikken; det her er hvad den giver kunden. Et fjerde trin ville
            gøre produktet sværere at forstå netop dér hvor det skal virke enkelt. */}
        <p className="sg-resultatlinje">{T.resultatlinje}</p>

        <p className="sg-afslut">{T.afslut}</p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="motor" {...ctaTekst(marked, "primaer")} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 5 · SMS-DEMO

// ⚠️ SMS-EKSEMPLET FØLGER FAGET. En VVS'er der lige har set sit eget fag i
// beviset og derefter får en rengøringsbesked som produkt-demo, læser det som at
// vi ikke havde et eksempel til ham. Teksterne er OPDIGTEDE illustrationer —
// mærket som eksempel i SmsTelefon — men de skal være opdigtede inden for
// kundens eget fag.
const SMS_EKSEMPEL = {
  rengoring: { fag: "Fast rengøring", hvad: "Rengøring af administrationsbygninger", sted: "Roskilde Kommune" },
  service: { fag: "Service", hvad: "Serviceaftale på tekniske anlæg", sted: "Roskilde Kommune" },
  elektriker: { fag: "El-installation", hvad: "Tavler og belysning på skole", sted: "Roskilde Kommune" },
  vvs: { fag: "VVS", hvad: "Udskiftning af varmeanlæg", sted: "Roskilde Kommune" },
  tomrer: { fag: "Tømrer", hvad: "Tag og facade på daginstitution", sted: "Roskilde Kommune" },
  entreprenor: { fag: "Entreprenør", hvad: "Byggemodning og kloakarbejde", sted: "Roskilde Kommune" },
};

export function SmsDemo({ fag = "rengoring", marked = "DK" }) {
  const T = tekster(marked).sms;
  // ⚠️ TELEFONENS INDHOLD FOELGER MARKEDET, IKKE FAGET, PAA GB.
  // SMS_EKSEMPEL er DK's 20 fag; GB har eet. Paa andre markeder tages
  // eksemplet derfor fra ordbogens `telefon`-blok, som SmsTelefon selv
  // slaar op naar den ikke faar props.
  const e = marked === "DK" ? (SMS_EKSEMPEL[fag] || SMS_EKSEMPEL.rengoring) : null;
  return (
    <section className="sg-sek">
      <div className="sg-wrap sg-demogrid">
        <div>
          <SmsTelefon
            marked={marked}
            titel={T.telefonTitel}
            fag={e?.fag}
            sted={e?.sted}
            hvad={e?.hvad}
            frist={T.telefonFrist}
          />
        </div>
        <div>
          <span className="sg-kick">{T.kick}</span>
          <h2 className="sg-big">{hus(marked, SMS_LINJE, "sms.linje")}</h2>
          {/* ⚠️ TO TEKSTNODER, PRAECIS SOM FOER. Literalen bar selv sit
              afsluttende mellemrum foran udtrykket; `+ " "` bevarer baade
              mellemrummet og nodestrukturen. React saetter <!-- --> mellem to
              nabo-tekstnoder, og et ekstra {" "} ville have givet tre. */}
          <p className="sg-lead">
            {T.lead1 + " "}{hus(marked, SMS_UNDER, "sms.lead2")}
          </p>
          {/* ⚠️ ÉN GANG PÅ HELE SIDEN. Sætningen er stærk netop fordi den er
              sjælden; står den tre steder, bliver den en talemåde. */}
          <p className="sg-afslut" style={{ textAlign: "left", margin: "18px 0 0", maxWidth: "34ch" }}>
            {hus(marked, IKKE_HOLDE_OEJE, "sms.ikkeHoldeOeje")}
          </p>
          {/* ⚠️ DANMARK RENDERER LISTEN LITTERALT, som før ordbogen fandtes.
              Et `.map()` sætter en `key` på hvert <li>, og key'en skrives ind i
              RSC-strømmen — baseline har `null`, en map har strengen. Danske
              sider flyttede sig altså af en ændring der ikke var synlig.
              Målt 09-09-2026. Grenen ligger om HELE <ul>, ikke om børnene:
              et fragment ville selv lægge et lag ind i strømmen. */}
          {marked === "DK" ? (
            <ul className="sg-punkter">
              <li><Flueben size={20} /> Kort resumé</li>
              <li><Flueben size={20} /> Frist</li>
              <li><Flueben size={20} /> Direkte link</li>
              <li><Flueben size={20} /> Bud-skabelon hvor relevant</li>
            </ul>
          ) : (
            <ul className="sg-punkter">
              {T.punkter.map((x) => <li key={x}><Flueben size={20} />{" " + x}</li>)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------- 3 · DET ER RIGTIGE OPGAVER

/**
 * Det økonomiske argument, tidligt.
 *
 * ⚠️ DEN LIGGER HØJT MED VILJE. Kold trafik fra Meta har hverken tid eller
 * grund til at scrolle til en prissektion. Størrelsesordenen på en opgave skal
 * stå FØR mekanikken — ellers læser man en forklaring på noget man ikke har
 * fået en grund til at interessere sig for.
 *
 * ⚠️ "KAN VÆRE", ALDRIG "ER". Vi ved ikke hvad den enkelte opgave er værd, og
 * beholdningen svinger fra uge til uge. "Kan være" er sandt; "er" ville være en
 * påstand om data vi ikke har.
 *
 * ⚠️ "I SKAL BARE VINDE ÉN" ER IKKE ET LØFTE. Den siger at der ikke skal MANGE
 * vundne opgaver til, før årsprisen er lille i sammenligning. Den må aldrig
 * omskrives til "I vinder én", og den må aldrig stå sammen med noget der
 * antyder en garanti. Se lib/salgTekst.js.
 */
export function RigtigeOpgaver({ funnelHref, marked = "DK" }) {
  const V = tekster(marked).vaerdi;
  return (
    <section className="sg-sek sg-blaa" id="vaerd">
      <div className="sg-wrap sg-midt">
        <span className="sg-kick">{V.kick}</span>
        {/* ⚠️ DEN BRITISKE OVERSKRIFT ER COPY-FILENS EGEN RESERVE, ikke dens
            hovedforslag. Filen skriver "hundreds of thousands of pounds" og
            tilføjer straks: "Do not state this unless current UK data supports
            this ... Preferred if proof is not yet ready". Der findes ingen
            britiske tal endnu, så vi bruger reserven. Det er ikke en
            udvanding — det er filens eget valg for præcis denne situation. */}
        <h2 className="sg-big">{hus(marked, STOERRELSE_LINJE, "vaerdi.stoerrelse")}</h2>
        <p className="sg-lead">
          {V.lead}
        </p>

        <div className="sg-vind">
          <span className="sg-vind-over">{hus(marked, VIND_EN.over, "vaerdi.vindOver")}</span>
          <span className="sg-vind-under">
            {hus(marked, VIND_EN.underDel1, "vaerdi.vindUnder1")}<b>{hus(marked, VIND_EN.underDel2, "vaerdi.vindUnder2")}</b>
          </span>
        </div>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="vaerd" {...ctaTekst(marked, "primaer")} />
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------- 4 · OFFENTLIGE OPGAVER

/**
 * Indvendingen: "det er kun for de store".
 *
 * ⚠️ SEKTIONEN FJERNER FRYGT, DEN SÆLGER IKKE. Derfor tre korte trin og ingen
 * forklaring af udbudsret. Skriver vi mere, bekræfter vi netop den mistanke
 * sektionen skal fjerne — at det er kompliceret.
 *
 * ⚠️ VI PÅSTÅR IKKE AT ALT ER NEMT. Der står at det ikke BEHØVER være bøvlet,
 * og at opgaverne kommer i forskellige størrelser. Begge dele er sande. "Alle
 * kan byde på alt" ville ikke være det.
 */
export function OffentligeOpgaver({ funnelHref, marked = "DK" }) {
  const O = tekster(marked).offentlige;
  return (
    <section className="sg-sek">
      <div className="sg-wrap sg-midt">
        <span className="sg-kick">{O.kick}</span>
        <h2 className="sg-big">{hus(marked, OFFENTLIGE.overskrift, "offentlige.overskrift")}</h2>
        <p className="sg-lead">{hus(marked, OFFENTLIGE.brod, "offentlige.brod")}</p>

        <div className="sg-tretrin">
          <div className="sg-tretrin-item">
            <span className="sg-tretrin-nr">1</span>
            <b>{O.trin[0]}</b>
          </div>
          <span className="sg-tretrin-pil" aria-hidden="true">→</span>
          <div className="sg-tretrin-item">
            <span className="sg-tretrin-nr">2</span>
            <b>{O.trin[1]}</b>
          </div>
          <span className="sg-tretrin-pil" aria-hidden="true">→</span>
          <div className="sg-tretrin-item">
            <span className="sg-tretrin-nr">3</span>
            <b>{O.trin[2]}</b>
          </div>
        </div>

        <p className="sg-afslut">
          {hus(marked, OFFENTLIGE.rolle1, "offentlige.rolle1")} {hus(marked, OFFENTLIGE.rolle2, "offentlige.rolle2")}
        </p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="offentlige" {...ctaTekst(marked, "primaer")} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ 8 · OVERGANGEN

/**
 * Den mørke overgang midt på siden.
 *
 * ⚠️ DEN SIGER NOGET NYT, IKKE DET SAMME IGEN. Sektionen ovenfor handler om hvad
 * en opgave kan være VÆRD; den her handler om at opgaverne allerede findes, og
 * at det eneste der mangler, er at man ser dem. Det er den samme pointe set fra
 * kundens side — ikke en gentagelse.
 */
export function Overgang({ funnelHref, marked = "DK" }) {
  const G = tekster(marked).overgang;
  return (
    <section className="sg-navy sg-overgang">
      <div className="sg-wrap sg-midt">
        <h2>{G.overskrift}</h2>
        {/* ⚠️ FREMHÆVNINGEN LIGGER MIDT I SÆTNINGEN, så linjen er delt i tre
            nøgler frem for én. Et <b> kan ikke bo i en streng uden at vi enten
            tillader HTML i ordbogen eller sætter markup sammen af tekst —
            begge dele er en dør vi ikke skal åbne for en enkelt fed halvdel. */}
        <p className="sg-overgang-stor">
          {G.stor1}<b>{G.stor2}</b>{G.stor3}
        </p>
        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="overgang" variant="hvid" stor {...ctaTekst(marked, "primaer")} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------- 5 · HVAD PROBLEMET KAN KOSTE

/**
 * Prisen på det man ikke ser.
 *
 * ⚠️ DET ER EN OMKOSTNINGS-SEKTION, IKKE EN PRIS-SEKTION. Den kommer lige efter
 * problemet og svarer på "og hvad så?". Selve sammenligningen med abonnementet
 * hører til nede ved prisen (<Vaerdi>); står hele regnestykket begge steder,
 * læses den anden som en gentagelse frem for som en afslutning.
 *
 * ⚠️ BELØBET ER ET MÆRKET EKSEMPEL. Vi har ingen data på hvad en dansk
 * rengøringsaftale er værd, og vi påstår det ikke. "EKSEMPEL"-badget står på
 * selve kortet — ikke som en fodnote man kan overse.
 *
 * ⚠️ INGEN TABT-OMSÆTNING-PÅSTAND. Der står ikke "I går glip af 120.000 kr." —
 * det ville forudsætte at kunden ville have vundet opgaven. Der står at en
 * opgave man ikke ser, ikke kan bydes på. Det er sandt uanset udfaldet.
 */
export function ProblemPris({ fag = "rengoring", marked = "DK" }) {
  const T = tekster(marked).koster;
  // ⚠️ VAERDI-ANKERET ER DANSK, OG DET BLIVER DET INDTIL DER ER BRITISKE TAL.
  // byggAnker regner paa DKK-belob fra lib/vaerdiAnker.js. Den fil siger selv:
  // "INGEN OPDIGTET UDBUDSSUM ... skal komme fra en RIGTIG opgave i basen med
  // oplyst vaerdi og vaere maerket som saadan."
  //
  // ⚠️ DE FEM GB-RENGOERINGSOPGAVER HAR FAKTISK BELOEB (£200k-£4,7 mio.), men
  // den offentlige side kan ikke laese `notices` - RLS spaerrer anon - og
  // get-opgave-tal returnerer bevidst KUN titel, koeber og tidspunkt. Det er
  // paywall-graensen fra 30-07-2026. At vise et beloeb her er derfor en
  // PRODUKTBESLUTNING, ikke en teknikalitet.
  //
  // Indtil da viser GB copy-filens belob-frie udgave. Den er sand uanset, og
  // det rigtige tal kan taendes senere uden at roere resten af sektionen.
  const a = marked === "DK" ? byggAnker(fag) : null;
  return (
    /* ⚠️ NAVY, IKKE HVID. Sektionen er sidens vigtigste direkte-respons-moment,
       og den stod før som endnu en hvid sektion mellem to andre hvide — nem at
       scrolle forbi. Navy bryder rytmen og siger "her skal du stoppe op".
       Farven er husets egen (--navy), ikke en ny. */
    <section className="sg-sek sg-navy sg-koster-sek">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">{T.kick}</span>
          <h2 className="sg-big">{T.overskrift}<br />{T.overskrift2}</h2>
          <p className="sg-lead sg-lead-lys">
            {a
              ? (a.loebende
                  ? "Et fast rengøringsjob kan være mange gange mere værd end et helt års Birdly."
                  : "En enkelt relevant opgave kan være mange gange mere værd end et helt års Birdly.")
              : T.lead}
          </p>
        </div>

        {/* ⚠️ BELOEB-KORTET RENDERES KUN NAAR DER ER ET AEGTE ANKER.
            GB har ingen godkendte britiske kontraktbeloeb endnu, og et tomt
            eller dansk kort ville vaere vaerre end intet. */}
        {a && (
        <div className="sg-koster">
          <div className="sg-koster-kort">
            {/* Samme delte badge som værdi-sektionen — se .sg-badge i salg.css. */}
            <span className="sg-badge">{a.badge}</span>
            {a.scenarie.length > 0 && (
              <ul className="sg-scenarie">
                {a.scenarie.map((linje) => <li key={linje}>{linje}</li>)}
              </ul>
            )}
            {a.loebende ? (
              <>
                <div className="sg-tal">{a.maaned}</div>
                <div className="sg-vaerdi-lig">har en årlig værdi på</div>
                <div className="sg-koster-stor">{a.aar}</div>
              </>
            ) : (
              <div className="sg-koster-stor">{a.opgave}</div>
            )}
          </div>
        </div>
        )}

        {/* ⚠️ INGEN TABT-OMSÆTNING-PÅSTAND. Der står ikke "I går glip af
            120.000 kr." — det ville forudsætte at kunden ville have vundet
            opgaven. Der står at en opgave man ikke ser, ikke kan bydes på. Det
            er sandt uanset udfaldet.
            ⚠️ GB's forbehold siger det samme med copy-filens egne ord:
            "Birdly doesn't promise you'll win the contract." */}
        {a?.kilde && <p className="sg-forbehold sg-forbehold-lys">{a.kilde}</p>}
        <p className="sg-forbehold sg-forbehold-lys">{a ? FORBEHOLD : T.forbehold}</p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 6 · LØSNINGEN

/**
 * Svaret på problemet, sagt så kort som det kan siges.
 *
 * ⚠️ FIRE PUNKTER, INGEN FEATURES. Hvert punkt er noget KUNDEN vælger — fag,
 * område, størrelse, type — ikke noget produktet indeholder. Det er forskellen
 * på "her er hvad vi kan" og "her er hvad I bestemmer".
 */
export function Loesningen({ funnelHref, marked = "DK" }) {
  const T = tekster(marked).loesningen;
  return (
    <section className="sg-sek sg-blaa">
      <div className="sg-wrap sg-midt">
        <span className="sg-kick">{T.kick}</span>
        <h2 className="sg-big">{T.overskrift}<br /><span style={{ color: "var(--teal)" }}>{T.overskrift2}</span></h2>

        {/* ⚠️ DANMARK RENDERER LISTEN LITTERALT, som før ordbogen fandtes.
              Et `.map()` sætter en `key` på hvert <li>, og key'en skrives ind i
              RSC-strømmen — baseline har `null`, en map har strengen. Danske
              sider flyttede sig altså af en ændring der ikke var synlig.
              Målt 09-09-2026. Grenen ligger om HELE <ul>, ikke om børnene:
              et fragment ville selv lægge et lag ind i strømmen. */}
        {marked === "DK" ? (
          <ul className="sg-fix">
            <li><Flueben size={19} /> Jeres fag</li>
            <li><Flueben size={19} /> Jeres område</li>
            <li><Flueben size={19} /> Jeres ønskede opgavestørrelse</li>
            <li><Flueben size={19} /> Private og offentlige muligheder</li>
          </ul>
        ) : (
          <ul className="sg-fix">
            {T.punkter.map((x) => <li key={x}><Flueben size={19} />{" " + x}</li>)}
          </ul>
        )}

        <p className="sg-lead">
          {T.lead}
        </p>
        <p className="sg-afslut">{T.afslut}</p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="loesning" {...ctaTekst(marked, "primaer")} />
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------- 10 · FAG-VÆLGER

/**
 * "Hvad laver I?" — hvert fag skal kunne se sig selv.
 *
 * ⚠️ HVERT KORT BÆRER ET RESULTAT, IKKE ET FAGNAVN. "Rengøring & service" alene
 * er en kategori; "Få flere faste og tilbagevendende opgaver" er en grund til at
 * klikke. Det er forskellen på en indholdsfortegnelse og et salgsargument.
 *
 * ⚠️ KORTENE PEGER PÅ DE EKSISTERENDE /fag/-SIDER. Der er IKKE lavet nye
 * /brancher/<fag>-ruter: de 20 fag-sider er indekserede, har hver sin canonical
 * og bærer husets interne links. En parallel rute med samme indhold ville sætte
 * to af vores egne sider op mod hinanden på de samme søgeord.
 *
 * ⚠️ INGEN TAL PÅ KORTENE. Et "Catering — 1 opgave" sælger værre end ingenting,
 * og tallet svinger med ugen. Det personlige tal hører hjemme i bevis-sektionen
 * og i funnelen, hvor det er knyttet til kundens egne kriterier.
 */
const FAG_KORT = [
  { slug: "rengoring", navn: "Rengøring & service", resultat: "Få flere faste og tilbagevendende opgaver.", cta: "Se rengøringsopgaver" },
  { slug: "elektriker", navn: "Elektriker", resultat: "Find relevante installations- og serviceopgaver.", cta: "Se elektrikeropgaver" },
  { slug: "vvs", navn: "VVS", resultat: "Find varme-, sanitets- og ventilationsopgaver.", cta: "Se VVS-opgaver" },
  { slug: "toemrer", navn: "Tømrer", resultat: "Find tag-, facade- og indretningsopgaver.", cta: "Se tømreropgaver" },
  { slug: "entreprenor", navn: "Entreprenør", resultat: "Find anlægs-, jord- og betonopgaver.", cta: "Se entreprenøropgaver" },
  { slug: null, navn: "Andre fag", resultat: "Birdly dækker 20 fag — fra maler og kloak til IT og catering.", cta: "Se alle fag" },
];

export function FagVaelgerKort({ marked = "DK" } = {}) {
  // ⚠️ ENDNU IKKE OVERSAT — SEKTIONEN UDELADER SIG SELV PAA ANDRE MARKEDER.
  // Hellere en manglende sektion end en dansk. Det er samme regel som
  // lib/tekster/index.js: en dansk saetning paa en britisk side er VAERRE end
  // en manglende, for den ser ud som om den hoerer til.
  // Naar sektionens engelske copy findes, flyttes strengene til ordbogen og
  // den her linje ryger. Indtil da er DK bit-for-bit uroert: `marked` er "DK",
  // og resten af funktionen er ikke aendret med eet tegn.
  if (marked !== "DK") return null;

  return (
    <section className="sg-sek" id="brancher">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Jeres fag</span>
          <h2 className="sg-big">Hvad laver I?</h2>
          <p className="sg-lead">Vælg jeres fag og se, hvilke typer opgaver Birdly kan finde til jer.</p>
        </div>

        <div className="sg-fagkort">
          {FAG_KORT.map((f) => (
            <Link key={f.navn} href={f.slug ? `/fag/${f.slug}` : "/brancher"} className="sg-fagkort-item">
              <b>{f.navn}</b>
              <span>{f.resultat}</span>
              <i>{f.cta} →</i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------- 7 · RISIKO FJERNET

export function RisikoFjernet({ funnelHref, marked = "DK" }) {
  const T = tekster(marked).risiko;
  return (
    <section className="sg-sek sg-blaa" id="risiko">
      <div className="sg-wrap">
        <div className="sg-risiko-kort">
          <span className="sg-kick">{T.kick}</span>
          {/* ⚠️ OVERSKRIFTEN NÆVNER DE 14 DAGE, IKKE DE 60. Prøveperioden er 14
              dage; matchgarantiens 60 dage handler om refusion og står i
              <GarantiFin> lige nedenfor. Smelter de sammen, lover overskriften
              en prøveperiode der er fire gange længere end den er. */}
          <h2>{hus(marked, GARANTI.overskrift, "risiko.overskrift")}</h2>
          <p className="sg-lead" style={{ margin: "14px auto 0" }}>
            {T.lead}
          </p>

          {/* ⚠️ HELE BLOKKEN ER GRENEN, IKKE BØRNENE. DK's fire punkter er de
              samme fire elementer i samme fire slots som før ordbogen fandtes.
              To fejl blev fanget her 09-09-2026, og begge var usynlige:
                1. et `.map()` sætter en `key`, og key'en skrives ind i
                   RSC-strømmen — baseline har `null`.
                2. et `<>…</>` omkring børnene ville selv lægge et lag ind, så
                   fire søskende blev til ét fragment. Derfor ligger grenen om
                   <div className="sg-fire"> og ikke inde i den.
              ⚠️ `{" " + x}` OG IKKE `" {x}"` i GB-grenen: to nabo-tekstnoder
              giver React's <!-- -->-markør. */}
          {marked === "DK" ? (
            <div className="sg-fire">
              <div className="sg-fire-item"><Flueben size={18} /> {TRIAL_DAYS} dage gratis</div>
              <div className="sg-fire-item"><Flueben size={18} /> Ingen binding</div>
              <div className="sg-fire-item"><Flueben size={18} /> Ingen portal</div>
              <div className="sg-fire-item"><Flueben size={18} /> Opsætning på få minutter</div>
            </div>
          ) : (
            <div className="sg-fire">
              <div className="sg-fire-item"><Flueben size={18} />{" " + T.proeveDage}</div>
              {T.punkter.map((x) => (
                <div className="sg-fire-item" key={x}><Flueben size={18} />{" " + x}</div>
              ))}
            </div>
          )}

          <div className="sg-cta-row" style={{ justifyContent: "center" }}>
            <Cta href={funnelHref} placering="risiko" {...ctaTekst(marked, "primaer")} />
          </div>

          <GarantiFin marked={marked} />
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------- 8 · KUNDEBEVIS

// ⚠️ SLÅET FRA, OG DET ER IKKE EN FORGLEMMELSE (bekræftet af Jonas 06-09-2026).
// Der findes ingen ægte, godkendte udtalelser i huset endnu. Et pladsholder-citat
// på en live side er både løgn over for kunden og i strid med markedsføringsloven
// — og et opdigtet "1 match → kontrakt på XXX.XXX kr." er den værste af slagsen,
// fordi det er præcis det bevis en køber leder efter.
//
// Sæt VIS_KUNDEBEVIS til true FØRST når der ligger rigtige udtalelser med navn,
// firma og skriftligt samtykke. Er der kun to gode, så vis to.
const VIS_KUNDEBEVIS = false;
const KUNDEBEVIS = []; // { citat, navn, firma }

export function Kundebevis({ marked = "DK" } = {}) {
  // ⚠️ ENDNU IKKE OVERSAT — SEKTIONEN UDELADER SIG SELV PAA ANDRE MARKEDER.
  // Hellere en manglende sektion end en dansk. Det er samme regel som
  // lib/tekster/index.js: en dansk saetning paa en britisk side er VAERRE end
  // en manglende, for den ser ud som om den hoerer til.
  // Naar sektionens engelske copy findes, flyttes strengene til ordbogen og
  // den her linje ryger. Indtil da er DK bit-for-bit uroert: `marked` er "DK",
  // og resten af funktionen er ikke aendret med eet tegn.
  if (marked !== "DK") return null;

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

// ------------------------------------------------------- 9 · IKKE EN PORTAL

export function IkkePortal({ marked = "DK" }) {
  const P = tekster(marked).portal;
  return (
    <section className="sg-sek">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">{P.kick}</span>
          <h2 className="sg-big">{P.overskrift}<br />{P.overskrift2}</h2>
        </div>

        {/* ⚠️ FORSKELLEN SKAL KUNNE SES, IKKE KUN LÆSES. De to kort så næsten ens
            ud, og så var sammenligningen noget man skulle regne ud. Nu er den
            gamle måde dæmpet og gråtonet, Birdly-kortet let løftet — men kun en
            anelse. Gør man forskellen for stor, ligner det en stråmand, og så
            mister hele sektionen troværdighed. */}
        <div className="sg-vs">
          <div className="sg-vs-kort sg-vs-gammel">
            <h3>{P.gammel.titel}</h3>
            <span className="sg-vs-under">{P.gammel.under}</span>
            {/* ⚠️ HER ER ET .map() DET RIGTIGE. Alle syv punkter deler det
                SAMME ikon, så der findes ingen parallel liste der kan skride —
                modsat de tre kort i Problemet, hvor hvert kort har sit eget. */}
            {/* ⚠️ DK LITTERALT: en `key` fra et .map() lander i RSC-strømmen, hvor
                baseline har `null`. Se den fulde note i SmsDemo. */}
            {marked === "DK" ? (
              <ul className="sg-vs-liste">
                <li><Kryds /> Log ind</li>
                <li><Kryds /> Søg</li>
                <li><Kryds /> Vælg filtre</li>
                <li><Kryds /> Gennemgå opgaver</li>
                <li><Kryds /> Læs</li>
                <li><Kryds /> Sortér</li>
                <li><Kryds /> Gentag</li>
              </ul>
            ) : (
              <ul className="sg-vs-liste">
                {P.gammel.punkter.map((x) => <li key={x}><Kryds />{" " + x}</li>)}
              </ul>
            )}
          </div>

          {/* Kun på desktop — på mobil stables kortene, og et "vs." midt imellem
              ville bare være en ekstra linje at scrolle forbi. */}
          <div className="sg-vs-imellem" aria-hidden="true"><span>vs.</span></div>

          <div className="sg-vs-kort sg-vs-ny">
            <h3>{P.ny.titel}</h3>
            <span className="sg-vs-under">{P.ny.under}</span>
            {/* ⚠️ HANDLINGERNE ER BIRDLYS, IKKE KUNDENS. Venstre side er syv ting
                kunden selv skal gøre; her gør Birdly tre af fire. Det er hele
                sammenligningen — ikke at vi har flere funktioner. */}
            {/* ⚠️ DK LITTERALT: en `key` fra et .map() lander i RSC-strømmen, hvor
                baseline har `null`. Se den fulde note i SmsDemo. */}
            {marked === "DK" ? (
              <ul className="sg-vs-liste">
                <li><Flueben size={18} /> Birdly holder øje</li>
                <li><Flueben size={18} /> Birdly finder relevante opgaver</li>
                <li><Flueben size={18} /> I får dem direkte på SMS</li>
                <li><Flueben size={18} /> I vælger, hvilke I vil gå videre med</li>
              </ul>
            ) : (
              <ul className="sg-vs-liste">
                {P.ny.punkter.map((x) => <li key={x}><Flueben size={18} />{" " + x}</li>)}
              </ul>
            )}
            {/* ⚠️ DEN KORTE LINJE BÆRER SEKTIONEN. Den lange ejer-sætning stod
                før som konklusion og druknede pointen; nu er den sekundær. */}
            <p className="sg-vs-payoff">{P.payoff}</p>
            <p className="sg-fin">{hus(marked, EJER_LINJE, "portal.ejerLinje")}</p>
          </div>
        </div>

        <p className="sg-afslut">
          {P.afslut}
        </p>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- 10 · PRISER

export function Priser({ funnelHref, medOverskrift = true, marked = "DK" }) {
  const T = tekster(marked).priser;
  // ⚠️ TO PRIS-KILDER, OG DE MÅ IKKE BLANDES.
  //   DK  lib/pakke.js  — husets enekilde, bundet til Frisbii. RØRES IKKE.
  //   GB  markets.js    — £59/£590, Jonas' beslutning, aldrig kurs-konverteret.
  // `p` er null for DK, og hver DK-linje nedenfor er derfor ord for ord den
  // samme som før.
  const p = marked === "DK" ? null : prisFor(marked);
  if (marked !== "DK" && !p) return null;

  // ⚠️ REGNET, IKKE SKREVET: 4.990 / 12 = 415,83 → "ca. 416 kr./md.". Et
  // håndskrevet tal ville stå forkert dagen efter en prisændring.
  const prMaaned = Math.round(PLAN.yearly / 12).toLocaleString("da-DK");  // kun DK

  return (
    <section className="sg-sek sg-graa" id="priser">
      <div className="sg-wrap">
        {medOverskrift && (
          <div className="sg-midt">
            <span className="sg-kick">{T.kick}</span>
            <h2 className="sg-big">{T.overskrift}</h2>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ÅRSPLANEN ER HOVEDTILBUDDET, MÅNEDEN ER STADIG SYNLIG.
            To ligeværdige kort lod kunden vælge mellem to ting hun ikke kunne
            se forskel på; nu er året ét stort kort med hele argumentet, og
            måneden en tydelig linje under. Skjult månedspris ville være den
            slags der opdages i checkouten og koster tilliden — den er der,
            den er bare ikke tilbuddet.

            ⚠️ BADGET HEDDER "BEDST VÆRDI", IKKE "MEST VALGTE". "Mest valgte" er
            en påstand om andre kunders adfærd, og vi har ikke tal der beviser
            den. "Bedst værdi" følger objektivt af priserne: 4.990 mod 5.988.
            ══════════════════════════════════════════════════════════════════ */}
        <div className="sg-tilbud">
          <div className="sg-plan sg-plan-frem">
            <span className="sg-plan-badge">{T.badge}</span>
            <span className="sg-plan-navn">{T.planNavn}</span>
            <div className="sg-pris-beloeb">{p ? p.aar : priceText.yearly}</div>
            {/* ⚠️ DK's linje er UÆNDRET; GB's samles af regnede tal. */}
            {/* ⚠️ DK's <small> HAR TRE BØRN, IKKE ÉN STRENG. Baseline er
                `ekskl. moms · ca. {prMaaned} kr./md.` — tekst, udtryk, tekst — og
                React sætter derfor `<!-- -->` omkring tallet. Skrev vi det som
                én template-streng, forsvandt markørerne og forsiden, /kom-i-gang
                og /priser flyttede sig. Målt 09-09-2026. */}
            {p ? (
              <small>{`${T.exVat} · ${T.omkring} ${p.prMaaned}`}</small>
            ) : (
              <small>ekskl. moms · ca. {prMaaned} kr./md.</small>
            )}

            {/* "Betal for 10 måneder — få 12" er bogstaveligt sandt: 4.990 ÷ 499
                er præcis 10. Besparelsen kommer fra YEARLY_SAVING. */}
            {/* ⚠️ DK's <div> HAR TRE BØRN, IKKE ÉN STRENG. Baseline skriver
                beløbet som et udtryk mellem to tekststykker, så React sætter
                `<!-- -->` omkring det. En template-streng slugte markørerne og
                flyttede forsiden, /kom-i-gang og /priser. Målt 09-09-2026.
                Grenen ligger om hele <div>, ikke om børnene — et fragment
                ville selv lægge et lag ind i strømmen. */}
            {p ? (
              <div className="sg-plan-spar">
                {`Pay for ${p.maanederBetalt} months. Get 12. Save ${p.spar}.`}
              </div>
            ) : (
              <div className="sg-plan-spar">
                Betal for 10 måneder — få 12. Spar {YEARLY_SAVING.amount.toLocaleString("da-DK")} kr.
              </div>
            )}

            {/* ⚠️ DK's SEKS LINJER ER UROERT. GB's samme seks bygges af
                ordbogen plus de to der har EEN kilde: proeveperioden og
                garantiens korte navn. */}
            {p ? (
              <ul className="sg-plan-liste">
                <li><Flueben size={17} />{" " + tekster(marked).risiko.proeveDage}</li>
                {T.punkter.map((x) => <li key={x}><Flueben size={17} />{" " + x}</li>)}
                <li><Flueben size={17} />{" " + (t(marked, "trust.3") || "")}</li>
                <li><Flueben size={17} />{" " + tekster(marked).risiko.punkter[0]}</li>
              </ul>
            ) : (
              <ul className="sg-plan-liste">
                <li><Flueben size={17} /> {TRIAL_DAYS} dage gratis</li>
                <li><Flueben size={17} /> Offentlige + private opgaver</li>
                <li><Flueben size={17} /> SMS + mail ved match</li>
                <li><Flueben size={17} /> Alle relevante kriterier</li>
                <li><Flueben size={17} /> {GARANTI.kort}</li>
                <li><Flueben size={17} /> Ingen binding</li>
              </ul>
            )}

            <Cta href={funnelHref} placering="priser-aar" bred stor>
              {p ? T.ctaAar : <>Start {TRIAL_DAYS} dage gratis</>}
            </Cta>
            <p className="sg-plan-fin">{hus(marked, VAERDI_ANKER, "priser.vaerdiAnker")}</p>
          </div>

          {/* Måneden: tydeligt tilgængelig, visuelt sekundær. */}
          <div className="sg-maaned">
            <div>
              <b>{T.maanedSpm}</b>
              {/* ⚠️ DK's <span> HAR FEM BØRN, IKKE ÉN STRENG: pris, tekst, tal,
                  tekst — og React sætter `<!-- -->` mellem hver nabo-tekstnode.
                  En template-streng slugte markørerne og flyttede forsiden,
                  /kom-i-gang og /priser. Målt 09-09-2026. Sidste led i en
                  række: se også sg-plan-spar og <small> ovenfor. */}
              {p ? (
                <span>
                  {`${p.maaned} ${T.exVat} · ${tekster(marked).risiko.proeveDage} · ${T.ingenBinding}`}
                </span>
              ) : (
                <span>{priceText.monthly} ekskl. moms · {TRIAL_DAYS} dage gratis · ingen binding</span>
              )}
            </div>
            <Cta href={funnelHref} placering="priser-maaned" variant="ghost">
              {T.ctaMaaned}
            </Cta>
          </div>
        </div>

        <div className="sg-garantiboks">
          <p><b>{hus(marked, GARANTI.overskrift, "risiko.overskrift")}</b></p>
          <GarantiFin klasse="sg-fin sg-fin-midt" marked={marked} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ 11 · RESULTAT IGEN

export function SlutCta({ funnelHref, marked = "DK" }) {
  const S = tekster(marked).slut;
  return (
    <section className="sg-navy sg-slut">
      <div className="sg-wrap">
        <h2>{S.overskrift}</h2>
        <p>{S.under}</p>
        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="slut" variant="hvid" stor {...ctaTekst(marked, "primaer")} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TrustRaekke mork marked={marked} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 12 · FAQ

/**
 * Konverterings-FAQ: seks købsspørgsmål synlige, resten et klik væk.
 *
 * ⚠️ INGEN VIGTIG SALGSINFO GEMMES HER. Garantien, prisen og prøveperioden står
 * i fuldt lys længere oppe; FAQ'en gentager dem for den der leder efter detaljen.
 *
 * ⚠️ RESTEN SLETTES IKKE — den foldes. Svarene er husets eneste sted med den
 * fulde forklaring (hvor opgaverne kommer fra, bud-skabelonen, antal SMS'er), og
 * de står i HTML'en uanset om detaljen er åben. De er stadig crawlbare.
 */
export function SalgFaq({ funnelHref, marked = "DK" }) {
  // ⚠️ TO GRENE, IKKE EN OVERSAT KOMPONENT. Den danske sti er ikke ændret med
  // ét tegn: samme kick, samme overskrift, samme <FaqListe /> uden props.
  // Den britiske sender sine egne lister ind i den SAMME komponent — se noten
  // i FaqListe.js om hvorfor en egen britisk komponent ikke gik.
  //
  // ⚠️ MANGLER ET MARKED SIN FAQ I ORDBOGEN, UDELADER SEKTIONEN SIG SELV.
  // Hellere en manglende sektion end en dansk. Samme regel som
  // lib/tekster/index.js: en dansk sætning på en britisk side er VÆRRE end en
  // manglende, for den ser ud som om den hører til.
  const T = marked === "DK" ? null : tekster(marked)?.faq;
  if (marked !== "DK" && !T?.top?.length) return null;

  return (
    <section className="sg-sek" id="faq">
      <div className="sg-wrap">
        <div className="sg-midt">
          {/* ⚠️ INGEN FRAGMENT-GREN OMKRING DE TO ELEMENTER. Et <>…</> her ville
              lægge et array ind hvor der før stod to elementer, og det flytter
              RSC-rækkerne på danske sider — samme klasse af fejl som den nye
              eksport i lib/markets.js. Valget ligger derfor INDE i hvert
              element, hvor det kun er en streng der skifter. */}
          <span className="sg-kick">{marked === "DK" ? "Spørgsmål" : T.kick}</span>
          <h2 className="sg-big">{marked === "DK" ? "Det, du tænker lige nu." : T.overskrift}</h2>
        </div>

        {/* ⚠️ SAMME KOMPONENT, ANDEN DATA. Den britiske FAQ laa foerst i sin
            egen fil, og den statiske import af den KLIENT-komponent lagde en
            ekstra chunk paa /priser og /sadan-virker-det - danske sider der
            aldrig renderer den. Se den fulde note i FaqListe.js.
            DK kalder fortsat uden props og faar husets egne lister. */}
        {marked === "DK" ? (
          <FaqListe />
        ) : (
          <FaqListe
            top={T.top}
            rest={T.rest}
            etiketter={{ merePrefix: T.merePrefix, mereSuffix: T.mereSuffix, skjul: T.skjul }}
          />
        )}

        {funnelHref && (
          <div className="sg-cta-row" style={{ justifyContent: "center" }}>
            <Cta href={funnelHref} placering="faq" {...ctaTekst(marked, "primaer")} />
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
 * ⚠️ ALDRIG INDE I B2B-FLOWET. Den stod før som et bånd midt på forsiden. To
 * ting gik galt: en håndværker der klikkede, landede i en formular hvor han
 * skulle beskrive et arbejde han gerne ville UDFØRE, og en husejer der klikkede
 * på "Find opgaver nu" landede i et CVR-felt.
 */
export function EfterspoergselsLink({ marked = "DK" } = {}) {
  // ⚠️ ENDNU IKKE OVERSAT — SEKTIONEN UDELADER SIG SELV PAA ANDRE MARKEDER.
  // Hellere en manglende sektion end en dansk. Det er samme regel som
  // lib/tekster/index.js: en dansk saetning paa en britisk side er VAERRE end
  // en manglende, for den ser ud som om den hoerer til.
  // Naar sektionens engelske copy findes, flyttes strengene til ordbogen og
  // den her linje ryger. Indtil da er DK bit-for-bit uroert: `marked` er "DK",
  // og resten af funktionen er ikke aendret med eet tegn.
  if (marked !== "DK") return null;

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
