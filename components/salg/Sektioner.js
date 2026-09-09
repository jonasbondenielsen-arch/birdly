import Link from "next/link";
import Cta, { CtaSekundaer } from "./Cta";
import SmsTelefon from "./SmsTelefon";
import FaqListe from "./FaqListe";
import { Flueben, Kryds, Oeje, Bunke, Ur } from "./Ikoner";
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


// ============================================================================
// DE DANSKE SEKTIONS-STRENGE.
//
// ⚠️ DE BOR HER, IKKE I lib/tekster/da.js - OG DET ER EN MAALT BESLUTNING.
// da.js blev lavet for at DK ikke skulle kunne flytte sig ved et uheld:
// komponenten slog op i stedet for at have teksten i sig. Men Sektioner.js
// importeres af components/Forside.js, som er "use client" - saa opslaget
// traak BEGGE ordboeger ned i den danske forsides klient-bundt, og
// klient-referencerne blev registreret i en anden raekkefoelge end i
// baseline. Forsiden var den eneste side der flyttede sig af det (09-09-2026).
//
// Strengene er FLYTTET hertil, ikke kopieret. To udgaver af den samme danske
// saetning ville kunne skride fra hinanden uden at nogen saa det, og det er
// praecis det da.js fandtes for at forhindre. Nu er der én udgave igen - den
// ligger bare dér hvor den bruges, som den gjorde foer ordbogen fandtes.
//
// ⚠️ RET ALDRIG EN STRENG HER "MENS DU ER I GANG". En forbedret formulering
// er en aendring af det live danske site og hoerer til sin egen opgave med
// sin egen godkendelse.
//
// ⚠️ HAARDE MELLEMRUM OG TANKESTREGER ER MEDTAGET MED VILJE. Hero'ens
// "rengoerings- og" har et haardt mellemrum, fordi linjen ellers braekkede
// efter bindestregen og blev laest som et delt ord. Erstattes det med et
// almindeligt mellemrum, ser diffen ens ud i en terminal og forskellig i en
// browser.
// ============================================================================

const DA_HERO = {
    eyebrow: "For rengørings- & servicevirksomheder",
    //   = hårdt mellemrum. Se noten øverst.
    // ⚠️ HAARDT MELLEMRUM, skrevet som kode med vilje. I komponenten
    // stod der `&nbsp;`. Skrev jeg et almindeligt mellemrum her, ville de to
    // strenge se ENS ud i en diff og FORSKELLIGE i browseren, hvor linjen igen
    // ville braekke efter bindestregen. Et usynligt tegn skal skrives synligt.
    overskrift: "Få flere rengørings- og serviceopgaver.",
    overskriftEm: "Uden selv at lede.",
    under:
      "Birdly finder offentlige og private opgaver, der passer til jeres virksomhed — og sender nye match direkte på SMS.",
    chips: ["Rengøring", "Vinduespolering", "Trappevask", "Ejendomsservice", "Erhvervsrengøring"],
    chipsLabel: "Eksempler på opgavetyper",
  };

const DA_BEVIS = {
    overskrift: "Birdly arbejder allerede",
    opdateret: "Sidst opdateret",
    // Etiketterne under hvert tal i bevis-bjælken.
    aabne: "opgaver med åben frist",
    bydbare: "opgaver vi holder øje med",
    nye: "nye de seneste 7 dage",
    frekvensTal: "2× dagligt",
    frekvens: "opdaterer Birdly",
  };

const DA_PROBLEMET = {
    kick: "Problemet",
    // ⚠️ TO NØGLER, FORDI DER STÅR ET <br /> IMELLEM. Slås de sammen til én
    // streng med et linjeskift, forsvinder linjebruddet i HTML.
    overskrift: "Opgaverne er der.",
    overskrift2: "Problemet er at finde de rigtige.",
    kort: [
      {
        titel: "Vi finder de rigtige.",
        tekst: "Vi sorterer støjen fra og finder de opgaver, der faktisk passer til jer.",
      },
      {
        titel: "Vi sender dem direkte til jer.",
        tekst: "Ingen daglig jagt i udbudsportaler. Når noget passer, får I besked.",
      },
      {
        titel: "De store skal ikke have det hele.",
        tekst:
          "Offentlige kontrakter er også for mindre virksomheder. Birdly gør det lettere at komme med i spillet.",
      },
    ],
    afslut: "Flere relevante opgaver. Mindre jagt. Mere forretning.",
  };

const DA_MOTOREN = {
    kick: "Sådan virker det",
    overskrift: "Du fortæller os én gang, hvad I leder efter.",
    overskrift2: "Birdly gør resten.",
    trin: [
      {
        nr: "01",
        titel: "Fortæl hvad I vil have",
        tekst: "Vælg fag, område og størrelsen på de opgaver, I vil høre om.",
      },
      {
        nr: "02",
        titel: "Birdly holder øje",
        tekst: "Vi finder relevante offentlige og private muligheder og sorterer resten fra.",
      },
      {
        nr: "03",
        titel: "Få besked",
        tekst: "Når noget passer, får I det direkte på SMS og mail.",
      },
    ],
    flow: ["Jeres kriterier", "Birdly holder øje", "SMS til jer"],
    resultatlinje: "Og så gør I kun noget, når opgaven er interessant.",
    afslut: "Ingen daglig søgning. Ingen portal. Ingen støj.",
  };

const DA_SMS = {
    kick: "Beskeden",
    // ⚠️ OVERSKRIFTEN OG DE TO LINJER KOMMER FRA salgTekst.js FOR DANMARK
    // (SMS_LINJE, SMS_UNDER, IKKE_HOLDE_OEJE). De står IKKE her — se `hus()`
    // i Sektioner.js. Kun det der stod inline i komponenten bor i ordbogen.
    lead1: "Birdly finder automatisk relevante offentlige og private opgaver til jeres virksomhed.",
    punkter: ["Kort resumé", "Frist", "Direkte link", "Bud-skabelon hvor relevant"],
    // Telefonens eksempel i DEN her sektion (SmsDemo) — ikke hero'ens.
    telefonTitel: "Nyt Birdly-match",
    telefonFrist: "18/09",
  };

const DA_VAERDI = {
    kick: "Det er rigtige opgaver",
    lead: "Birdly finder relevante offentlige og private opgaver til jer. I vælger selv, hvilke I vil byde på.",
  };

const DA_OFFENTLIGE = {
    kick: "Offentlige opgaver",
    trin: ["Birdly finder opgaven", "I får den på SMS", "I vælger, om I vil byde"],
  };

const DA_OVERGANG = {
    overskrift: "De opgaver er der allerede.",
    // ⚠️ MELLEMRUMMENE I ENDERNE HØRER TIL. Sætningen var delt af et <b> midt
    // inde i sig selv, og de to tekstnoder bar hver sit mellemrum.
    stor1: "Spørgsmålet er bare, om I ",
    stor2: "ser dem",
    stor3: " — og byder på dem.",
  };

const DA_KOSTER = {
    kick: "Hvad det kan koste",
    overskrift: "Den opgave, I ikke ser,",
    overskrift2: "kan I heller ikke byde på.",
  };

const DA_LOESNINGEN = {
    kick: "Løsningen",
    overskrift: "Birdly leder.",
    // ⚠️ ANDEN HALVDEL STÅR I ET <span> MED EGEN FARVE. To nøgler, fordi der
    // er et <br /> og en farve imellem — ikke fordi sætningen er delt.
    overskrift2: "I får besked.",
    punkter: [
      "Jeres fag",
      "Jeres område",
      "Jeres ønskede opgavestørrelse",
      "Private og offentlige muligheder",
    ],
    lead: "Når noget passer, sender Birdly det direkte på SMS og mail.",
    afslut: "Mindre søgning. Flere relevante muligheder.",
  };

const DA_RISIKO = {
    kick: "Prøv det uden risiko",
    // ⚠️ OVERSKRIFTEN ER GARANTI.overskrift FRA salgTekst.js. Den står ikke
    // her: garanti-tekst har ÉN kilde, og CLAUDE.md er skarp på det.
    lead: "Se først, hvad Birdly finder til jeres virksomhed. 0 kr. i dag.",
    // ⚠️ FØRSTE PUNKT BYGGES AF TRIAL_DAYS ("{n} dage gratis"), fordi tallet
    // kommer fra lib/pakke.js. Derfor står kun de tre faste her.
    punkter: ["Ingen binding", "Ingen portal", "Opsætning på få minutter"],
  };

const DA_PORTAL = {
    kick: "Forskellen",
    overskrift: "Endnu en portal?",
    overskrift2: "Nej tak.",
    gammel: {
      titel: "Den gamle måde",
      under: "En almindelig udbudstjeneste",
      punkter: ["Log ind", "Søg", "Vælg filtre", "Gennemgå opgaver", "Læs", "Sortér", "Gentag"],
    },
    ny: {
      titel: "Birdly",
      under: "Jeres kriterier, én gang",
      // ⚠️ HANDLINGERNE ER BIRDLYS, IKKE KUNDENS. Venstre side er syv ting
      // kunden selv skal gøre; her gør Birdly tre af fire. Det ER hele
      // sammenligningen — ikke at vi har flere funktioner.
      punkter: [
        "Birdly holder øje",
        "Birdly finder relevante opgaver",
        "I får dem direkte på SMS",
        "I vælger, hvilke I vil gå videre med",
      ],
    },
    payoff: "I leder ikke. Birdly gør.",
    // ⚠️ EJER-SÆTNINGEN STÅR IKKE HER. Den kommer fra EJER_LINJE i
    // salgTekst.js, og CLAUDE.md siger den skal blive stående ordret to steder.
    // En kopi hertil ville være et tredje sted den kunne skride fra.
    afslut:
      "Birdly er ikke lavet til at give jer mere software. Det er lavet til at give jer relevante opgaver.",
  };

const DA_PRISER = {
    kick: "Én pakke. Alt inkluderet.",
    overskrift: "Prøv gratis. Behold Birdly, hvis det giver mening.",
    badge: "Bedst værdi",
    planNavn: "Årligt",
    // ⚠️ SELVE BELØBENE STÅR IKKE HER. De kommer fra lib/pakke.js, som er
    // husets enekilde og bundet til Frisbii. CLAUDE.md: hardkod ALDRIG et
    // beløb i en komponent — og en kopi i ordbogen ville være præcis det.
    punkter: [
      "Offentlige + private opgaver",
      "SMS + mail ved match",
      "Alle relevante kriterier",
    ],
    maanedSpm: "Foretrækker I månedlig betaling?",
    ctaMaaned: "Vælg månedsbetaling",
    ingenBinding: "ingen binding",
  };

const DA_SLUT = {
    overskrift: "Den næste relevante opgave findes måske allerede.",
    under: "Lad Birdly holde øje for jer.",
  };

// ---------------------------------------------------------------- hjælpere

/**
 * ⚠️ SEKTIONERNE LAESER IKKE ORDBOGEN. DE FAAR `ord`.
 *
 * Filen importerede `lib/tekster` og `lib/markets` indtil 09-09-2026. Det
 * saa uskyldigt ud - Sektioner.js er jo serverkode - men components/
 * Forside.js er "use client" og importerer 17 sektioner herfra. Dermed
 * havnede BEGGE ordboeger i den danske forsides klient-bundt, og
 * klient-referencerne blev registreret i en anden raekkefoelge end i
 * baseline. Forsiden var den eneste side der flyttede sig af det.
 *
 * Nu kommer teksten ind som data fra Salgsside (server):
 *
 *     ord == null   ->  DANSK. Sektionen laeser husets egne konstanter
 *                       (salgTekst.js, pakke.js, vaerdiAnker.js) uaendret.
 *                       Det er CLAUDE.md's regel: EEN kilde pr. saetning.
 *     ord != null   ->  markedets tekst, faerdig-slaaet op paa serveren.
 *
 * ⚠️ ET ANDET MARKED FALDER ALDRIG TILBAGE TIL DANSK. Mangler en noegle, er
 * vaerdien undefined, og afsnittet udelades - samme regel som
 * lib/tekster/index.js. En dansk saetning paa en britisk side er vaerre end
 * en manglende: den ser ud som om den hoerer til.
 *
 * ⚠️ DK MAA HELLER IKKE FAA `ord={null}` SOM PROP. En prop paa en
 * klient-komponent serialiseres uanset vaerdi. Salgsside spreder derfor
 * null i stedet for at sende en tom prop. Se noten i Cta.js.
 */


/**
 * CTA-knappens tekst som props - og INTET for Danmark.
 *
 * ⚠️ Cta er en KLIENT-komponent, saa hver prop den faar, skrives ind i
 * RSC-stroemmen. `marked="DK"` lagde altsaa "marked":"DK" ind i hver eneste
 * danske side (maalt 09-09-2026 paa forsiden, /hvorfor-birdly og
 * /kom-i-gang). Prop'ens vaerdi var korrekt; problemet var at den fandtes.
 *
 * Returnerer null naar teksten er dansk, saa `{...ctaProp(undefined)}`
 * spreder ingenting og knappen faar noejagtig de props den fik foer.
 */
function ctaProp(tekst) {
  return tekst ? { tekst } : null;
}

function TrustRaekke({ mork = false, raekke = TRUST }) {
  // DK bruger husets TRUST fra salgTekst.js UAENDRET - det er default-vaerdien,
  // saa den danske sti er bogstaveligt talt den samme som foer ordbogen fandtes.
  // Andre markeder faar deres egen raekke ind som prop. Der oversaettes ikke i koden.
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
export function GarantiFin({ klasse = "sg-fin", ord = null }) {
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
  const praecis = ord ? ord.garantiPraecis : GARANTI.praecis;
  const forbehold = ord ? ord.garantiForbehold : GARANTI.forbehold;
  const linkTekst = ord ? ord.garantiLink : GARANTI.linkTekst;
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
  // ⚠️ TEKSTEN ER EN PROP, IKKE ET ORDBOGSOPSLAG. Laeste komponenten selv
  // headers(), ville forsiden blive DYNAMISK og miste sin cache - og DK's
  // statiske forside er praecis det der ikke maa roeres. Den danske rute
  // sender ingenting og renderer noejagtig som foer.
  ord = null,
}) {
  const T = ord || DA_HERO;
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
            <Cta href={funnelHref} placering="hero" stor {...ctaProp(T.ctaPrimaer)} />
            {/* ⚠️ SEKUNDÆRENS MÅL ER EN PROP, FORDI /sadan-virker-det ER EN
                DANSK SIDE. Uden den ville den britiske hero have sendt en
                britisk besøgende til dansk tekst — et dødt spor midt i
                løftet. DK's default er uændret. */}
            <CtaSekundaer href={sekundaerHref} placering="hero-sekundaer" {...ctaProp(T.ctaSekundaer)} />
          </div>
          <TrustRaekke raekke={T.trust} />
        </div>
        <div>
          {/* ⚠️ MARKEDET SKAL MED HERTIL. Uden det stod telefonen på dansk midt
              i den britiske hero — se noten i SmsTelefon.js. */}
          {/* ⚠️ `ord.telefon`, IKKE `ord`. Hero's egen skive er hero-teksten;
              telefonen har sin egen. Sendte vi hele hero-skiven, fandt
              SmsTelefon ingen af sine noegler - og fordi den falder tilbage til
              DA_TELEFON KUN naar prop'en er tom, blev resultatet en TOM
              telefon paa den britiske side. Ikke dansk, ikke engelsk: tom.
              Set paa et skaermbillede af produktionen 09-09-2026; ingen af
              mine indholds-tjek saa den, fordi de talte sektioner og ledte
              efter danske tegn - ikke efter om teksten var DER. */}
          <SmsTelefon ord={ord?.telefon} />
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
export function BevisBjaelke({ tal, ord = null }) {
  const T = ord || DA_BEVIS;
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

export function Problemet({ ord = null }) {
  const T = ord || DA_PROBLEMET;
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

export function Motoren({ funnelHref, ord = null }) {
  const T = ord || DA_MOTOREN;
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
          <Cta href={funnelHref} placering="motor" {...ctaProp(T.ctaPrimaer)} />
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

export function SmsDemo({ fag = "rengoring", ord = null }) {
  const T = ord || DA_SMS;
  // ⚠️ TELEFONENS INDHOLD FOELGER MARKEDET, IKKE FAGET, PAA GB.
  // SMS_EKSEMPEL er DK's 20 fag; GB har eet. Paa andre markeder tages
  // eksemplet derfor fra ordbogens `telefon`-blok, som SmsTelefon selv
  // slaar op naar den ikke faar props.
  const e = ord ? null : (SMS_EKSEMPEL[fag] || SMS_EKSEMPEL.rengoring);
  return (
    <section className="sg-sek">
      <div className="sg-wrap sg-demogrid">
        <div>
          <SmsTelefon
            ord={ord?.telefon}
            titel={T.telefonTitel}
            fag={e?.fag}
            sted={e?.sted}
            hvad={e?.hvad}
            frist={T.telefonFrist}
          />
        </div>
        <div>
          <span className="sg-kick">{T.kick}</span>
          <h2 className="sg-big">{ord ? ord.linje : SMS_LINJE}</h2>
          {/* ⚠️ TO TEKSTNODER, PRAECIS SOM FOER. Literalen bar selv sit
              afsluttende mellemrum foran udtrykket; `+ " "` bevarer baade
              mellemrummet og nodestrukturen. React saetter <!-- --> mellem to
              nabo-tekstnoder, og et ekstra {" "} ville have givet tre. */}
          <p className="sg-lead">
            {T.lead1 + " "}{ord ? ord.lead2 : SMS_UNDER}
          </p>
          {/* ⚠️ ÉN GANG PÅ HELE SIDEN. Sætningen er stærk netop fordi den er
              sjælden; står den tre steder, bliver den en talemåde. */}
          <p className="sg-afslut" style={{ textAlign: "left", margin: "18px 0 0", maxWidth: "34ch" }}>
            {ord ? ord.ikkeHoldeOeje : IKKE_HOLDE_OEJE}
          </p>
          {/* ⚠️ DANMARK RENDERER LISTEN LITTERALT, som før ordbogen fandtes.
              Et `.map()` sætter en `key` på hvert <li>, og key'en skrives ind i
              RSC-strømmen — baseline har `null`, en map har strengen. Danske
              sider flyttede sig altså af en ændring der ikke var synlig.
              Målt 09-09-2026. Grenen ligger om HELE <ul>, ikke om børnene:
              et fragment ville selv lægge et lag ind i strømmen. */}
          {!ord ? (
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
export function RigtigeOpgaver({ funnelHref, ord = null }) {
  const V = ord || DA_VAERDI;
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
        <h2 className="sg-big">{ord ? ord.stoerrelse : STOERRELSE_LINJE}</h2>
        <p className="sg-lead">
          {V.lead}
        </p>

        <div className="sg-vind">
          <span className="sg-vind-over">{ord ? ord.vindOver : VIND_EN.over}</span>
          <span className="sg-vind-under">
            {ord ? ord.vindUnder1 : VIND_EN.underDel1}<b>{ord ? ord.vindUnder2 : VIND_EN.underDel2}</b>
          </span>
        </div>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="vaerd" {...ctaProp(V.ctaPrimaer)} />
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
export function OffentligeOpgaver({ funnelHref, ord = null }) {
  const O = ord || DA_OFFENTLIGE;
  return (
    <section className="sg-sek">
      <div className="sg-wrap sg-midt">
        <span className="sg-kick">{O.kick}</span>
        <h2 className="sg-big">{ord ? ord.overskrift : OFFENTLIGE.overskrift}</h2>
        <p className="sg-lead">{ord ? ord.brod : OFFENTLIGE.brod}</p>

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
          {ord ? ord.rolle1 : OFFENTLIGE.rolle1} {ord ? ord.rolle2 : OFFENTLIGE.rolle2}
        </p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="offentlige" {...ctaProp(O.ctaPrimaer)} />
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
export function Overgang({ funnelHref, ord = null }) {
  const G = ord || DA_OVERGANG;
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
          <Cta href={funnelHref} placering="overgang" variant="hvid" stor {...ctaProp(G.ctaPrimaer)} />
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
export function ProblemPris({ fag = "rengoring", ord = null }) {
  const T = ord || DA_KOSTER;
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
  const a = ord ? null : byggAnker(fag);
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
export function Loesningen({ funnelHref, ord = null }) {
  const T = ord || DA_LOESNINGEN;
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
        {!ord ? (
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
          <Cta href={funnelHref} placering="loesning" {...ctaProp(T.ctaPrimaer)} />
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

export function FagVaelgerKort({ ord = null } = {}) {
  // ⚠️ ENDNU IKKE OVERSAT — SEKTIONEN UDELADER SIG SELV PAA ANDRE MARKEDER.
  // Hellere en manglende sektion end en dansk. Det er samme regel som
  // lib/tekster/index.js: en dansk saetning paa en britisk side er VAERRE end
  // en manglende, for den ser ud som om den hoerer til.
  // Naar sektionens engelske copy findes, flyttes strengene til ordbogen og
  // den her linje ryger. Indtil da er DK bit-for-bit uroert: `marked` er "DK",
  // og resten af funktionen er ikke aendret med eet tegn.
  if (ord) return null;

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

export function RisikoFjernet({ funnelHref, ord = null }) {
  const T = ord || DA_RISIKO;
  return (
    <section className="sg-sek sg-blaa" id="risiko">
      <div className="sg-wrap">
        <div className="sg-risiko-kort">
          <span className="sg-kick">{T.kick}</span>
          {/* ⚠️ OVERSKRIFTEN NÆVNER DE 14 DAGE, IKKE DE 60. Prøveperioden er 14
              dage; matchgarantiens 60 dage handler om refusion og står i
              <GarantiFin> lige nedenfor. Smelter de sammen, lover overskriften
              en prøveperiode der er fire gange længere end den er. */}
          <h2>{ord ? ord.overskrift : GARANTI.overskrift}</h2>
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
          {!ord ? (
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
            <Cta href={funnelHref} placering="risiko" {...ctaProp(T.ctaPrimaer)} />
          </div>

          <GarantiFin ord={ord} />
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

export function Kundebevis({ ord = null } = {}) {
  // ⚠️ ENDNU IKKE OVERSAT — SEKTIONEN UDELADER SIG SELV PAA ANDRE MARKEDER.
  // Hellere en manglende sektion end en dansk. Det er samme regel som
  // lib/tekster/index.js: en dansk saetning paa en britisk side er VAERRE end
  // en manglende, for den ser ud som om den hoerer til.
  // Naar sektionens engelske copy findes, flyttes strengene til ordbogen og
  // den her linje ryger. Indtil da er DK bit-for-bit uroert: `marked` er "DK",
  // og resten af funktionen er ikke aendret med eet tegn.
  if (ord) return null;

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

export function IkkePortal({ ord = null }) {
  const P = ord || DA_PORTAL;
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
            {!ord ? (
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
            {!ord ? (
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
            <p className="sg-fin">{ord ? ord.ejerLinje : EJER_LINJE}</p>
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

export function Priser({ funnelHref, medOverskrift = true, ord = null }) {
  const T = ord || DA_PRISER;
  // ⚠️ TO PRIS-KILDER, OG DE MÅ IKKE BLANDES.
  //   DK  lib/pakke.js  — husets enekilde, bundet til Frisbii. RØRES IKKE.
  //   GB  markets.js    — £59/£590, Jonas' beslutning, aldrig kurs-konverteret.
  // `p` er null for DK, og hver DK-linje nedenfor er derfor ord for ord den
  // samme som før.
  // ⚠️ PRISEN REGNES PAA SERVEREN OG KOMMER IND SOM DATA. Den laa foer i en
  // lokal prisFor() der laeste MARKEDER fra lib/markets.js - og det modul
  // fulgte med ned i den danske forsides klient-bundt. Se noten oeverst.
  const p = ord ? ord.pris : null;
  if (ord && !p) return null;

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
                <li><Flueben size={17} />{" " + ord.proeveDage}</li>
                {T.punkter.map((x) => <li key={x}><Flueben size={17} />{" " + x}</li>)}
                <li><Flueben size={17} />{" " + (ord.trust3 || "")}</li>
                <li><Flueben size={17} />{" " + ord.risikoIngenBinding}</li>
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
            <p className="sg-plan-fin">{ord ? ord.vaerdiAnker : VAERDI_ANKER}</p>
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
                  {`${p.maaned} ${T.exVat} · ${ord.proeveDage} · ${T.ingenBinding}`}
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
          <p><b>{ord ? ord.garantiOverskrift : GARANTI.overskrift}</b></p>
          <GarantiFin klasse="sg-fin sg-fin-midt" ord={ord} />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ 11 · RESULTAT IGEN

export function SlutCta({ funnelHref, ord = null }) {
  const S = ord || DA_SLUT;
  return (
    <section className="sg-navy sg-slut">
      <div className="sg-wrap">
        <h2>{S.overskrift}</h2>
        <p>{S.under}</p>
        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="slut" variant="hvid" stor {...ctaProp(S.ctaPrimaer)} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TrustRaekke mork raekke={S.trust} />
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
export function SalgFaq({ funnelHref, ord = null }) {
  // ⚠️ TO GRENE, IKKE EN OVERSAT KOMPONENT. Den danske sti er ikke ændret med
  // ét tegn: samme kick, samme overskrift, samme <FaqListe /> uden props.
  // Den britiske sender sine egne lister ind i den SAMME komponent — se noten
  // i FaqListe.js om hvorfor en egen britisk komponent ikke gik.
  //
  // ⚠️ MANGLER ET MARKED SIN FAQ I ORDBOGEN, UDELADER SEKTIONEN SIG SELV.
  // Hellere en manglende sektion end en dansk. Samme regel som
  // lib/tekster/index.js: en dansk sætning på en britisk side er VÆRRE end en
  // manglende, for den ser ud som om den hører til.
  if (ord && !ord.top?.length) return null;

  return (
    <section className="sg-sek" id="faq">
      <div className="sg-wrap">
        <div className="sg-midt">
          {/* ⚠️ INGEN FRAGMENT-GREN OMKRING DE TO ELEMENTER. Et <>…</> her ville
              lægge et array ind hvor der før stod to elementer, og det flytter
              RSC-rækkerne på danske sider — samme klasse af fejl som den nye
              eksport i lib/markets.js. Valget ligger derfor INDE i hvert
              element, hvor det kun er en streng der skifter. */}
          <span className="sg-kick">{ord ? ord.kick : "Spørgsmål"}</span>
          <h2 className="sg-big">{ord ? ord.overskrift : "Det, du tænker lige nu."}</h2>
        </div>

        {/* ⚠️ SAMME KOMPONENT, ANDEN DATA. Den britiske FAQ laa foerst i sin
            egen fil, og den statiske import af den KLIENT-komponent lagde en
            ekstra chunk paa /priser og /sadan-virker-det - danske sider der
            aldrig renderer den. Se den fulde note i FaqListe.js.
            DK kalder fortsat uden props og faar husets egne lister. */}
        {!ord ? (
          <FaqListe />
        ) : (
          <FaqListe
            top={ord.top}
            rest={ord.rest}
            etiketter={{ merePrefix: ord.merePrefix, mereSuffix: ord.mereSuffix, skjul: ord.skjul }}
          />
        )}

        {funnelHref && (
          <div className="sg-cta-row" style={{ justifyContent: "center" }}>
            <Cta href={funnelHref} placering="faq" {...ctaProp(ord?.ctaPrimaer)} />
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
export function EfterspoergselsLink({ ord = null } = {}) {
  // ⚠️ ENDNU IKKE OVERSAT — SEKTIONEN UDELADER SIG SELV PAA ANDRE MARKEDER.
  // Hellere en manglende sektion end en dansk. Det er samme regel som
  // lib/tekster/index.js: en dansk saetning paa en britisk side er VAERRE end
  // en manglende, for den ser ud som om den hoerer til.
  // Naar sektionens engelske copy findes, flyttes strengene til ordbogen og
  // den her linje ryger. Indtil da er DK bit-for-bit uroert: `marked` er "DK",
  // og resten af funktionen er ikke aendret med eet tegn.
  if (ord) return null;

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
