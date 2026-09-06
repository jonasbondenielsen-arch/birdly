import Link from "next/link";
import Cta, { CtaSekundaer } from "./Cta";
import SmsTelefon from "./SmsTelefon";
import FaqListe from "./FaqListe";
import { Flueben, Kryds, Oeje, Bunke, Ur } from "./Ikoner";
import { daTal, fmtOpdateret } from "../../lib/opgaveTal";
import { PLAN, priceText, YEARLY_SAVING, TRIAL_DAYS } from "../../lib/pakke";
import { GARANTI, GARANTI_LINK, TRUST, VAERDI_ANKER, EJER_LINJE } from "../../lib/salgTekst";
import { byggAnker, BETINGET_LINJE } from "../../lib/vaerdiAnker";

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
 * Garantiens præcise mekanik med link til den fulde ordlyd.
 *
 * ⚠️ DEN SKAL FØLGE MED HVER GANG GARANTI-OVERSKRIFTEN VISES. Overskriften siger
 * "14 dage gratis. Ingen relevante match? Så betaler du ikke." — uden den her
 * linje står der ikke nogen steder at garantien løber 60 dage og handler om
 * REFUSION, ikke om en fire gange længere prøveperiode. Se noten i
 * lib/salgTekst.js: det er den letteste og dyreste fejl at lave her.
 */
export function GarantiFin({ klasse = "sg-fin" }) {
  return (
    <p className={klasse}>
      {GARANTI.praecis} {GARANTI.forbehold}{" "}
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
              herunder — så salgs-copy'en ikke koster placeringer. */}
          <h1>
            {overskrift || <>Få flere relevante opgaver.</>}
            <span className="sg-em">Uden selv at lede.</span>
          </h1>
          {/* ⚠️ ÉN SÆTNING, OG DER MÅ IKKE KOMME MERE. Hero'en skal forstås på
              under fem sekunder; hver ekstra linje her koster af den tid. */}
          <p className="sg-lead">
            {under || (
              <>
                Birdly finder de offentlige og private opgaver, der passer til jeres
                virksomhed — og sender dem direkte på SMS og mail.
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
 * Mangler et felt, renderes cellen ikke; er der ingen data, renderer hele
 * bjælken sig væk. Vi hardkoder ALDRIG et live-agtigt tal.
 *
 * ⚠️ DEN MÅ IKKE KONKURRERE MED HERO'EN. Overskriften "BIRDLY ARBEJDER ALLEREDE"
 * er det første øjet skal fange — tallene er dokumentationen bagefter, ikke
 * sidens hovedbudskab. Derfor er de mindre end H1 og bjælken er lav.
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
                ALDRIG new Date(). En klokke der viser "nu" beviser ingenting. */}
            <small>opdatering dagligt</small>
          </div>
        </div>
        {opdateret && <p className="sg-bevis-opd">Sidst opdateret {opdateret}</p>}
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 3 · PROBLEMET

export function Problemet() {
  return (
    <section className="sg-sek" id="problem">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Problemet</span>
          <h2 className="sg-big">Opgaverne er der.<br />Problemet er at finde de rigtige.</h2>
        </div>

        {/* ⚠️ ÉN LINJE PR. KORT. Sektionen skal kunne læses på fem sekunder på en
            telefon; den lange version stod i vejen for beviset længere nede.
            Ingen skræmmekampagne — tre nøgterne konstateringer om en hverdag
            kunden kender. */}
        <div className="sg-tre">
          <div className="sg-kort">
            <div className="sg-kort-ic"><Oeje /></div>
            <h3>Du skal selv holde øje</h3>
            <p>Nye opslag kommer løbende — mens I passer jeres virksomhed.</p>
          </div>
          <div className="sg-kort">
            <div className="sg-kort-ic"><Bunke /></div>
            <h3>Det meste er ikke relevant</h3>
            <p>Forkert fag, område eller opgavestørrelse.</p>
          </div>
          <div className="sg-kort">
            <div className="sg-kort-ic"><Ur /></div>
            <h3>Den rigtige kan blive overset</h3>
            <p>En relevant mulighed kan dukke op, mens fokus er et helt andet sted.</p>
          </div>
        </div>

        <p className="sg-afslut">
          Birdly vender det om: I fortæller os, hvad I vil have. Vi holder øje. I får besked.
        </p>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- 4 · MOTOREN

export function Motoren({ funnelHref }) {
  return (
    <section className="sg-sek sg-graa" id="hvordan">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Sådan virker det</span>
          <h2 className="sg-big">Du fortæller os én gang, hvad I leder efter.<br />Birdly gør resten.</h2>
        </div>

        {/* ⚠️ TRE TRIN, IKKE FIRE, og ingen teknisk forklaring. Bud-skabelonen er
            ægte og god, men som fjerde trin gør den produktet sværere at forstå
            netop dér hvor det skal virke enkelt. Den bor i SMS-sektionen. */}
        <div className="sg-trin">
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">01</div>
            <h3>Fortæl hvad I vil have</h3>
            <p>Vælg fag, område og størrelsen på de opgaver, I vil høre om.</p>
          </div>
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">02</div>
            <h3>Birdly holder øje</h3>
            <p>Vi finder relevante offentlige og private muligheder og sorterer resten fra.</p>
          </div>
          <div className="sg-trin-kort">
            <div className="sg-trin-nr">03</div>
            <h3>Få besked</h3>
            <p>Når noget passer, får I det direkte på SMS og mail.</p>
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

// ------------------------------------------------------------ 5 · SMS-DEMO

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
          <p className="sg-lead">
            Birdly samler det vigtigste, så I hurtigt kan se, om opgaven er interessant.
          </p>
          <ul className="sg-punkter">
            <li><Flueben size={20} /> Kort resumé</li>
            <li><Flueben size={20} /> Frist</li>
            <li><Flueben size={20} /> Direkte link</li>
            <li><Flueben size={20} /> Bud-skabelon hvor relevant</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------- 6 · ØKONOMISK VÆRDI

/**
 * Sammenligningen mellem hvad en opgave kan være værd og hvad Birdly koster.
 *
 * ⚠️ DET ER EN SAMMENLIGNING, IKKE ET AFKAST. Vi siger aldrig at kunden tjener
 * noget, får noget igen eller opnår et forhold — vi stiller to beløb ved siden
 * af hinanden og skriver rent ud at vi ikke garanterer en vundet opgave.
 * Reglen og alle tal bor i lib/vaerdiAnker.js; læs noten dér før du ændrer
 * en formulering.
 *
 * ⚠️ BELØBENE ER MÆRKEDE EKSEMPLER. Vi har ingen data på hvad kundens opgaver
 * er værd, og vi påstår det ikke. "Eksempel"-mærkatet står på selve kortet, ikke
 * som småtryk nedenunder.
 *
 * ⚠️ ERSTATTER "365 DAGE vs. 4.990 KR." Det gamle anker sammenlignede en
 * tidsperiode med en pris, og det svarer ikke på spørgsmålet kunden faktisk
 * stiller: hvad kan det her være værd for MIG. Et beløb mod et beløb gør.
 *
 * @param {string} fag  fagnøgle — afgør om ankeret er en løbende aftale
 *                      (rengøring/service) eller et enkeltprojekt.
 */
export function Vaerdi({ funnelHref, fag = "rengoring", valgt = null }) {
  const a = byggAnker(fag, valgt);

  return (
    <section className="sg-sek sg-graa" id="vaerdi">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Regnestykket</span>
          <h2 className="sg-big">
            {a.loebende ? "Hvad er én god fast kunde værd?" : "Hvad er én god opgave værd?"}
          </h2>
          <p className="sg-lead">
            Birdly koster {priceText.yearlyBare} ekskl. moms for et helt år.
          </p>
        </div>

        <div className="sg-vaerdi">
          <div className="sg-vaerdi-boks">
            {/* ⚠️ MÆRKATET ER IKKE PYNT. Uden det læses beløbet som noget vi har
                målt eller lover. Det er et realistisk eksempel, ikke data. */}
            <span className="sg-maerkat">{a.maerkat}</span>
            {a.loebende ? (
              <>
                <div className="sg-vaerdi-navn">Fast rengøringsaftale</div>
                <div className="sg-tal">{a.maaned}</div>
                <div className="sg-vaerdi-lig">=</div>
                <div className="sg-vaerdi-aar">{a.aar}</div>
              </>
            ) : (
              <>
                <div className="sg-vaerdi-navn">Én relevant opgave</div>
                <div className="sg-tal">{a.opgave}</div>
              </>
            )}
          </div>

          <div className="sg-vaerdi-vs" aria-hidden="true">mod</div>

          <div className="sg-vaerdi-boks sg-pris-side">
            <span className="sg-maerkat sg-maerkat-lys">Faktisk pris</span>
            <div className="sg-vaerdi-navn">Birdly — et helt år</div>
            <div className="sg-tal">{priceText.yearlyBare}</div>
            <div className="sg-vaerdi-aar">ekskl. moms</div>
          </div>
        </div>

        {/* ⚠️ FORHOLDSTALLET BESKRIVER TO BELØB, IKKE ET UDBYTTE. Formuleringen
            "svarer til ca. 19× Birdlys årspris" siger noget om størrelsen på en
            kontrakt sammenlignet med en abonnementspris. "Birdly giver 19× igen"
            ville sige noget om penge der kommer retur, og dét må vi ikke. */}
        {a.forhold && (
          <p className="sg-anker">
            {a.loebende
              ? <>Én vundet aftale i den størrelse svarer til <b>{a.forhold.tekst}</b> Birdlys årspris.</>
              : <>Et helt års Birdly svarer til <b>{a.andel}</b> af værdien på en opgave i den størrelse.</>}
          </p>
        )}

        {/* ⚠️ FORBEHOLDET ER OBLIGATORISK OG STÅR LIGE UNDER TALLET. Det er dét
            der gør sammenligningen sand frem for et løfte. Flyt det aldrig ned
            under knappen, og gør det aldrig mindre end her. */}
        <p className="sg-forbehold">{a.forbehold}</p>
        <p className="sg-afslut" style={{ marginTop: 10 }}>{BETINGET_LINJE}</p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="vaerdi" />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------- 7 · RISIKO FJERNET

export function RisikoFjernet({ funnelHref }) {
  return (
    <section className="sg-sek sg-blaa" id="risiko">
      <div className="sg-wrap">
        <div className="sg-risiko-kort">
          <span className="sg-kick">Prøv det uden risiko</span>
          {/* ⚠️ OVERSKRIFTEN NÆVNER DE 14 DAGE, IKKE DE 60. Prøveperioden er 14
              dage; matchgarantiens 60 dage handler om refusion og står i
              <GarantiFin> lige nedenfor. Smelter de sammen, lover overskriften
              en prøveperiode der er fire gange længere end den er. */}
          <h2>{GARANTI.overskrift}</h2>
          <p className="sg-lead" style={{ margin: "14px auto 0" }}>
            Se først, hvad Birdly finder til jeres virksomhed. 0 kr. i dag.
          </p>

          <div className="sg-fire">
            <div className="sg-fire-item"><Flueben size={18} /> {TRIAL_DAYS} dage gratis</div>
            <div className="sg-fire-item"><Flueben size={18} /> Ingen binding</div>
            <div className="sg-fire-item"><Flueben size={18} /> Ingen portal</div>
            <div className="sg-fire-item"><Flueben size={18} /> Opsætning på få minutter</div>
          </div>

          <div className="sg-cta-row" style={{ justifyContent: "center" }}>
            <Cta href={funnelHref} placering="risiko" />
          </div>

          <GarantiFin />
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

// ------------------------------------------------------- 9 · IKKE EN PORTAL

export function IkkePortal() {
  return (
    <section className="sg-sek">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Forskellen</span>
          <h2 className="sg-big">Endnu en portal?<br />Nej tak.</h2>
        </div>

        <div className="sg-vs">
          <div className="sg-vs-kort sg-vs-gammel">
            <h3>En almindelig udbudstjeneste</h3>
            <ul className="sg-vs-liste">
              <li><Kryds /> Login</li>
              <li><Kryds /> Søg</li>
              <li><Kryds /> Sæt filtre op</li>
              <li><Kryds /> Åbn opgaver én efter én</li>
              <li><Kryds /> Læs</li>
              <li><Kryds /> Sortér</li>
              <li><Kryds /> Gentag</li>
            </ul>
          </div>
          <div className="sg-vs-kort sg-vs-ny">
            <h3>Birdly</h3>
            <ul className="sg-vs-liste">
              <li><Flueben size={18} /> Vælg jeres kriterier én gang</li>
              <li><Flueben size={18} /> Få relevante match direkte på SMS og mail</li>
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

// -------------------------------------------------------------- 10 · PRISER

export function Priser({ funnelHref, medOverskrift = true }) {
  // ⚠️ REGNET, IKKE SKREVET: 4.990 / 12 = 415,83 → "ca. 416 kr./md.". Et
  // håndskrevet tal ville stå forkert dagen efter en prisændring.
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
            <span className="sg-plan-badge">Bedst værdi</span>
            <span className="sg-plan-navn">Årligt</span>
            <div className="sg-pris-beloeb">{priceText.yearly}</div>
            <small>ekskl. moms · ca. {prMaaned} kr./md.</small>

            {/* "Betal for 10 måneder — få 12" er bogstaveligt sandt: 4.990 ÷ 499
                er præcis 10. Besparelsen kommer fra YEARLY_SAVING. */}
            <div className="sg-plan-spar">
              Betal for 10 måneder — få 12. Spar {YEARLY_SAVING.amount.toLocaleString("da-DK")} kr.
            </div>

            <ul className="sg-plan-liste">
              <li><Flueben size={17} /> {TRIAL_DAYS} dage gratis</li>
              <li><Flueben size={17} /> Offentlige + private opgaver</li>
              <li><Flueben size={17} /> SMS + mail ved match</li>
              <li><Flueben size={17} /> Alle relevante kriterier</li>
              <li><Flueben size={17} /> {GARANTI.kort}</li>
              <li><Flueben size={17} /> Ingen binding</li>
            </ul>

            <Cta href={funnelHref} placering="priser-aar" bred stor>
              Start {TRIAL_DAYS} dage gratis
            </Cta>
            <p className="sg-plan-fin">{VAERDI_ANKER}</p>
          </div>

          {/* Måneden: tydeligt tilgængelig, visuelt sekundær. */}
          <div className="sg-maaned">
            <div>
              <b>Foretrækker I månedlig betaling?</b>
              <span>{priceText.monthly} ekskl. moms · {TRIAL_DAYS} dage gratis · ingen binding</span>
            </div>
            <Cta href={funnelHref} placering="priser-maaned" variant="ghost">
              Vælg månedsbetaling
            </Cta>
          </div>
        </div>

        <div className="sg-garantiboks">
          <p><b>{GARANTI.overskrift}</b></p>
          <GarantiFin klasse="sg-fin sg-fin-midt" />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ 11 · RESULTAT IGEN

export function SlutCta({ funnelHref }) {
  return (
    <section className="sg-navy sg-slut">
      <div className="sg-wrap">
        <h2>Den næste relevante opgave findes måske allerede.</h2>
        <p>Lad Birdly holde øje for jer.</p>
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
export function SalgFaq({ funnelHref }) {
  return (
    <section className="sg-sek" id="faq">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Spørgsmål</span>
          <h2 className="sg-big">Det, du tænker lige nu.</h2>
        </div>

        <FaqListe />

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
 * ⚠️ ALDRIG INDE I B2B-FLOWET. Den stod før som et bånd midt på forsiden. To
 * ting gik galt: en håndværker der klikkede, landede i en formular hvor han
 * skulle beskrive et arbejde han gerne ville UDFØRE, og en husejer der klikkede
 * på "Find opgaver nu" landede i et CVR-felt.
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
