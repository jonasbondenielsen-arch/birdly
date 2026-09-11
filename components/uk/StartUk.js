"use client";

import { useMemo, useState } from "react";
import { Logo } from "../Logo";
import { tekster } from "../../lib/tekster";
import { submitSignup, createSubscriptionSession } from "../../lib/catalog";
import { daTal } from "../../lib/opgaveTal";
import "../../app/start.css";

// ── BÅNDENES LOFT I MATCH-REGLEN ───────────────────────────────────────────
//
// ⚠️ FIRE TAL DER IKKE FINDES ENDNU — OG DE MÅ IKKE GÆTTES.
// Båndet er ikke en etiket: det bliver til `max_amount` på kunden, og
// max_amount er dét matchmotoren filtrerer på. Vælger hun "Under £25,000" og
// vi sætter loftet forkert, får hun en anden liste end den hun bad om — og
// intet på skærmen ville afsløre det.
//
// ⚠️ LOFTET ER IKKE ETIKETTENS EGEN GRÆNSE. Det er fristelsen, og DK gør
// bevidst det modsatte: "Under 100.000 kr." har maks 1.000.000 (se
// PROJEKT_VALG i components/Start.js). Loftet er med vilje rummeligere end
// spændet, fordi et udbuds beløb sjældent er det kunden ender med. At læse
// tallene ud af de britiske etiketter ville derfor give GB en ANDEN
// matchsemantik end DK — ikke den samme regel i en anden valuta.
//
// Jonas' brief 09-09-2026 fastlagde båndenes NAVNE. Tallene er en
// produktbeslutning der mangler. Indtil de fire står her, afviser funnelen at
// gemme en tilmelding frem for at gemme et gæt.
const GB_BAAND_MAKS = {
  "u25k": null,
  "25k-100k": null,
  "100k-500k": null,
  "500k+": null,
};

// ============================================================================
// DEN BRITISKE FUNNEL — /uk/start
//
// ⚠️ EGEN KOMPONENT, IKKE EN GREN I components/Start.js. Den danske funnel er
// 2.184 linjer og er husets ENESTE kanal der tager imod penge. Dens logik er
// DK-specifik hele vejen ned: CVR, +45, DKK-bånd bundet til match-reglen,
// Reepay, garantiens 3.5-undtagelse. At parameterisere alt det ville være en
// stor ændring af den live betalingssti for at kunne bygge en ny funnel —
// præcis den slags "mens jeg er her"-arbejde der vælter noget der virker.
//
// ⚠️ MEN COPY'EN DELES. Hver eneste streng herunder kommer fra ordbogen
// (lib/tekster/en.js), som er bundet til copy-filen og Jonas' brief af
// scripts/verify-uk-copy.mjs. Der findes ingen tekst i den her fil.
//
// ⚠️ INGEN FAGVÆLGER. UK lanceres cleaning-only: ét fag med match-data. En
// vælger med ét valg er en formular der lader som om den spørger. Faget tages
// fra kataloget (ikke hardkodet), så den dag GB får flere fag, er det ét sted
// der skal ændres — ikke en liste her.
//
// ⚠️ HVAD DEN IKKE GØR ENDNU: den gemmer ikke. `signup` er en skrivesti, og
// den har bevidst ikke preview-døren fra get-catalog — dér skal værten være
// eneste sandhed. Sidste trin er derfor en kort-gate der viser prisen og
// stopper. Ingen rigtige træk, GB er DRAFT.
// ============================================================================

const SKAERME = ["firma", "omraade", "stoerrelse", "type", "match", "kontakt", "betaling"];

// ⚠️ SEKS INTERNE SKAERME, TRE SYNLIGE ETAPER - og kunden ser aldrig de
// seks. Husets regel fra components/Start.js: et taelleværk ("Step 3 of 6")
// fortaeller hvor lang formularen er; en etape fortaeller hvad man er i gang
// med. DK fjernede taelleværket 06-09-2026, og UK genindfoerer det ikke.
//
// Tilfoejes eller fjernes en skaerm, aendres KUN tabellen her.
//   firma       -> Company
//   omraade     -> Work
//   stoerrelse  -> Work
//   type        -> Work
//   kontakt     -> Start Birdly
//   betaling    -> Start Birdly
//   match       -> Your matches
const SKAERM_ETAPE = [0, 1, 1, 1, 2, 3, 3];

// ⚠️ SPEJLER app/api/company/route.js. Samme regel, to steder — Edge/route og
// klient kan ikke dele kode her uden at trække serverkoden ind i bundtet.
// Ændrer du den ene, skal du ændre den anden.
function normaliserFirmanummer(raa) {
  const s = String(raa || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!s) return null;
  if (/^\d+$/.test(s)) return s.length <= 8 ? s.padStart(8, "0") : null;
  return /^[A-Z]{2}\d{6}$/.test(s) ? s : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UK-mobil → E.164. 07xxxxxxxxx (11 cifre) er den almindelige form.
function tilE164Uk(raa) {
  const d = String(raa || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("44") && d.length === 12) return "+" + d;
  if (d.startsWith("0") && d.length === 11) return "+44" + d.slice(1);
  if (d.length === 10) return "+44" + d;
  return null;
}

export default function StartUk({ katalog, pris, hjem, aaben = false, tal = null }) {
  const ORD = tekster("GB");
  const T = ORD.funnel;
  // ⚠️ SAMME STRENG SOM FORSIDEN, praecis som DK genbruger sin. Der er ikke
  // skrevet ny copy til funnelen.
  const SPROG = ORD.bevis.sprog;
  const VIND = { over: ORD.vaerdi.vindOver, under1: ORD.vaerdi.vindUnder1, under2: ORD.vaerdi.vindUnder2 };
  const [skaerm, setSkaerm] = useState(0);
  const [fejl, setFejl] = useState(null);
  const [sender, setSender] = useState(false);
  const [kvittering, setKvittering] = useState(null);

  const [nummer, setNummer] = useState("");
  const [firma, setFirma] = useState(null);      // svaret fra Companies House
  const [soeger, setSoeger] = useState(false);
  const [besked, setBesked] = useState(null);    // advarsel, ikke en spærring

  const [omraader, setOmraader] = useState([]);
  const [baand, setBaand] = useState(null);
  const [type, setType] = useState("begge");
  const [firmanavn, setFirmanavn] = useState("");
  const [email, setEmail] = useState("");
  const [mobil, setMobil] = useState("");

  // ⚠️ FAGET KOMMER FRA KATALOGET. Med cleaning-only er der ét, men koden
  // spørger ikke hvor mange der er — den tager dem der er.
  const fag = katalog.fag;
  const regioner = katalog.regions || [];

  const videre = () => { setFejl(null); setSkaerm((s) => Math.min(s + 1, SKAERME.length - 1)); };
  const tilbage = () => { setFejl(null); setSkaerm((s) => Math.max(s - 1, 0)); };

  // ── Companies House ────────────────────────────────────────────────────────
  // ⚠️ ASYMMETRIEN ER HELE POINTEN, og den er DK's CVR-gates:
  //   ugyldigt format → stop (vi VED den er forkert)
  //   ikke fundet     → blokér nummer-stien, men tilbyd cleaning-vejen
  //   opslag fejler   → LUK IGENNEM. Vores fejl må aldrig spærre en rigtig
  //                     virksomhed ude midt i en tilmelding.
  //   dissolved       → advar, men lad hende gå videre. Den der stod bag
  //                     handler måske videre som sole trader.
  async function slaaOp() {
    setFejl(null);
    setBesked(null);
    const norm = normaliserFirmanummer(nummer);
    if (!norm) { setFejl(T.firma.ugyldig); return; }

    setSoeger(true);
    try {
      const r = await fetch(`/api/company?number=${encodeURIComponent(norm)}`);
      const b = await r.json().catch(() => null);

      if (b?.found) {
        setFirma(b);
        if (!firmanavn) setFirmanavn(b.name || "");
        if (String(b.status || "").toLowerCase() === "dissolved") {
          setBesked(T.firma.oploest);
        }
        videre();
        return;
      }
      if (b?.reason === "not_found") { setFejl(T.firma.ikkeFundet); return; }
      if (b?.reason === "invalid") { setFejl(T.firma.ugyldig); return; }

      // lookup_failed — og alt andet uventet. Luk igennem.
      setBesked(T.firma.opslagFejlede);
      videre();
    } catch {
      setBesked(T.firma.opslagFejlede);
      videre();
    } finally {
      setSoeger(false);
    }
  }

  // ⚠️ CLEANING-VEJEN. Bruges af BÅDE "Don't have a company number?" og af en
  // kunde hvis selskab står som dissolved. Ingen firmanummer opdigtes: `firma`
  // forbliver null, og det er i sig selv provenance — vi kan bagefter se
  // forskel på et navn Companies House gav os og et kunden selv skrev.
  function fortsaetSomRengoering() {
    setFejl(null);
    setFirma(null);
    videre();
  }

  const valgtBaand = useMemo(
    () => T.stoerrelse.baand.find((b) => b.key === baand) || null,
    [baand, T.stoerrelse.baand]
  );

  // ── SKRIVESTIEN ────────────────────────────────────────────────────────────
  //
  // ⚠️ SAMME `signup` SOM DANMARK, IKKE EN BRITISK GENVEJ. Alle værn bor i
  // Edge Function'en — dublet-firmanummer/telefon, nul-dækning, min>max, gate 2
  // (ingen adgang før kortet binder). En separat britisk skrivesti ville betyde
  // at de værn kun gjaldt det halve af huset. Markedet udleder serveren selv af
  // værten; klienten kan ikke vælge det.
  //
  // ⚠️ TRE TING KAN SPÆRRE, OG DE ER ALLE SANDE-TILSTANDE:
  //   1. markedet er kommercielt lukket (GB.lanceret === false)
  //   2. bandets loft er ikke besluttet (GB_BAAND_MAKS)
  //   3. sole trader-vejen har intet firmanummer, og signup kræver et
  // Ingen af dem omgås med et gæt. De vises som det de er.
  async function tilmeld() {
    setFejl(null);

    // ⚠️ DEN KOMMERCIELLE LUK-GATE. GB er DRAFT og noindex; der oprettes ingen
    // kunder før markedet åbnes. Flaget kommer fra markedsmodellen som en prop —
    // ikke fra en import af lib/markets her, fordi det her er en KLIENT-
    // komponent og en ny importør af den fil har før flyttet danske sider.
    if (!aaben) { setKvittering("lukket"); return; }

    // ⚠️ SOLE TRADER-VEJEN KAN IKKE GEMMES ENDNU. `signup` bruger firmanummeret
    // som identitetsnøgle: dublet-værnet, historikken og Frisbii-koblingen
    // hænger alle på den. Uden et nummer er der ingen nøgle — og at opfinde en
    // ville betyde to konti for samme virksomhed uden at nogen kunne se det.
    const firmanummer = normaliserFirmanummer(nummer);
    if (!firmanummer) { setKvittering("uden-nummer"); return; }

    const maks = GB_BAAND_MAKS[baand];
    if (maks === null || maks === undefined) { setKvittering("mangler-baand"); return; }

    setSender(true);
    try {
      // ⚠️ FELTET HEDDER `cvr` HELE VEJEN. Det er husets navn på virksomhedens
      // identitetsnøgle, og kolonnen bærer nu markedets eget nummer. At døbe
      // det om her ville betyde at klient og server talte om to ting.
      const svar = await submitSignup({
        company_name: firmanavn.trim(),
        cvr: firmanummer,
        contact_name: firmanavn.trim(),
        email: email.trim().toLowerCase(),
        phone: tilE164Uk(mobil),
        fag_keys: fag.map((f) => f.key),
        cpv_selections: fag.flatMap((f) => f.codes || []),
        bredde: "alle",
        region_keys: omraader,
        min_amount: null,
        max_amount: maks,
        notify_email: true,
        notify_sms: true,
        marketing_consent: false,
        terms_accepted: true,
        package: "monthly",
      });

      // ⚠️ CHECKOUT FORSØGES, OG DEN FORVENTES AT AFVISE. Der findes ingen
      // GBP-plan i Frisbii endnu (Clearhaus sætter GBP op), og
      // create-subscription-session falder ALDRIG tilbage på den danske plan —
      // det ville trække en britisk kunde i DKK. Afvisningen er det rigtige
      // svar, og den vises som en ventetilstand, ikke som en fejl kunden har
      // lavet.
      try {
        const sess = await createSubscriptionSession({
          subscriber_id: svar.id,
          email: email.trim().toLowerCase(),
          contact_name: firmanavn.trim(),
          phone: tilE164Uk(mobil),
          billing: "monthly",
        });
        setKvittering({ type: "checkout", session: sess.session_id, id: svar.id });
      } catch (e) {
        setKvittering({ type: "venter-paa-plan", id: svar.id, grund: String(e?.message || e) });
      }
    } catch (e) {
      setFejl(String(e?.message || e));
    } finally {
      setSender(false);
    }
  }

  function naeste() {
    setFejl(null);
    const navn = SKAERME[skaerm];
    if (navn === "omraade" && !omraader.length) { setFejl(T.omraade.label); return; }
    if (navn === "stoerrelse" && !baand) { setFejl(T.stoerrelse.label); return; }
    if (navn === "kontakt") {
      if (!firmanavn.trim()) { setFejl(T.kontakt.firmanavn); return; }
      if (!EMAIL_RE.test(email)) { setFejl(T.kontakt.email); return; }
      if (!tilE164Uk(mobil)) { setFejl(T.kontakt.mobil); return; }
    }
    videre();
  }

  const navn = SKAERME[skaerm];
  const etape = SKAERM_ETAPE[skaerm];

  return (
    // ⚠️ SAMME STRUKTUR SOM DK's FUNNEL, og det er ikke kosmetik.
    // `start.css` styler knapperne med DESCENDANT-selektorer: `.st-wrap .btn`
    // og `.st-wrap .btn-teal`. Ligger noget uden for `.st-wrap`, har det ingen
    // knapstil overhovedet. Min foerste udgave havde en ydre `.st`-div (som
    // slet ikke findes i CSS'en) med `st-top` UDEN for `st-wrap` - saa toppen
    // stod ustylet. DK wrapper i <main className="st-wrap"> med toppen INDENI.
    <main className="st-wrap" lang="en-GB">
      <div className="st-top">
        <Logo height={30} wordmark={tekster("GB").footer.brand} />
        <a className="st-tilbage-link" href={hjem}>{T.tilbage}</a>
      </div>

      {/* ⚠️ FUNNELENS TOP - DEN MANGLEDE HELT.
          `funnel.eyebrow`, `.overskrift`, `.under` og `.intro` laa i ordbogen
          fra foerste dag og blev ALDRIG rendret: komponenten aabnede direkte
          i firmanummer-feltet, saa den britiske funnel havde logo, et
          tilbage-link og et input - og intet argument. DK's funnel har hele
          `st-pre`-blokken foer feltet, og noten dér siger hvorfor:
          indvendingen skal besvares FOER man beder om noget.
          Opdaget af scripts/verify-uk-indhold.mjs 09-09-2026.

          ⚠️ KUN FOERSTE TRIN. Paa trin 2-6 har den besoegende allerede
          sagt ja; saelger man videre dér, ser det ud som om man er i tvivl.

          ⚠️ DK's TRIN-INDIKATOR ER IKKE MED. Den kraever fire etape-navne
          ("1 Virksomhed · 2 Opgaver · 3 Dine match · 4 Start Birdly"), og de
          findes ikke paa engelsk - hverken i copy-filen eller i en brief.
          Hellere en manglende indikator end fire navne jeg selv har fundet
          paa. Flagget til Jonas. */}
      {/* ⚠️ ETAPERNE STAAR OVER KORTET, OGSAA PAA FOERSTE SKAERM. De er en
          orientering, ikke en kvittering: den der lander her skal kunne se at
          det er kort, FOER hun skriver noget. Markup og klasser er husets
          egne (.st-etaper i app/start.css) - `nu` for den aktuelle, `gjort`
          for de overstaaede. */}
      <ol
        className="st-etaper"
        aria-label={`${T.etapeOrd} ${etape + 1} ${T.etapeAf} ${T.etaper.length}: ${T.etaper[etape]}`}
      >
        {T.etaper.map((e, i) => (
          <li key={e} className={i < etape ? "gjort" : i === etape ? "nu" : ""}>
            <span className="st-etape-prik" aria-hidden="true">{i < etape ? "✓" : i + 1}</span>
            <span className="st-etape-navn">{e}</span>
          </li>
        ))}
      </ol>

      {navn === "firma" && (
        <div className="st-pre">
          <div className="st-pre-venstre">
            <span className="st-pre-pill">{T.eyebrow}</span>
            <h1>{T.overskrift}</h1>
            <p className="st-pre-sub">{T.under}</p>
            <p className="st-pre-sms">{T.intro}</p>

            {/* ⚠️ TRUST-RAEKKEN STAAR FOER FELTET, ikke efter. Det er DK's
                begrundelse i Start.js: indvendingen skal vaere besvaret inden
                man beder om noget.
                ⚠️ STRENGEN ER COPY-FILENS EGEN, §26 "Trust:" - skrevet TIL
                funnelen. Den stod indtil nu kun paa betalings-trinnet, hvor
                den kom for sent. Punkterne er filens egen liste, delt paa
                dens egen "·"-separator: samme ord, husets struktur. */}
            {/* ⚠️ DK'S TRE PUNKTER, IKKE TRUST-LINJENS. De besvarer en anden
                indvending - at det bliver besvaerligt - og Trust-linjen
                (£0/14 days/lock-in) staar under knappen, hvor DK ogsaa har den.
                Begge findes paa DK's skaerm; begge findes nu her. */}
            <ul className="st-pre-trust">
              {T.punkter.map((t) => (
                <li key={t}><span>✓</span> {t}</li>
              ))}
            </ul>

            {/* ⚠️ "YOU JUST NEED TO WIN ONE" ER IKKE ET LOEFTE, og den er DK's
                egen konstruktion (st-vind i components/Start.js). Den siger at
                der ikke skal MANGE vundne kontrakter til, foer aarsprisen er
                lille i sammenligning. Skriv den aldrig om til "you will win one".
                ⚠️ STRENGEN GENBRUGES FRA FORSIDEN, praecis som DK genbruger sin.
                Ingen ny copy er opfundet til funnelen. */}
            <div className="st-vind">
              <span className="st-vind-over">{VIND.over}</span>
              <span className="st-vind-under">{VIND.under1}<b>{VIND.under2}</b></span>
            </div>

            {/* ⚠️ INDVENDINGEN STAAR FOER FELTET, ikke efter. DK's begrundelse,
                ordret: "det er kun for de store" er den grund folk lukker fanen
                med - den skal vaere besvaret inden de bliver bedt om noget. */}
            <div className="st-smaa">
              <b>{T.smaa.smaaOverskrift}</b>
              <p>{T.smaa.smaaBrod}</p>
            </div>

            {/* ⚠️ KOMPAKT SAMMENLIGNING, IKKE EN PRISSEKTION. Den skal kun goere
                det foerste klik oekonomisk indlysende. Beloebene til venstre er
                stoerrelsesordener med "can be" foran - ikke et konkret udbud, og
                aldrig et tal vi har fundet paa. Prisen til hoejre kommer fra
                markedsmodellen, ikke fra en kurs-omregning. */}
            <div className="st-minianker">
              <div className="st-minianker-side">
                <span>{T.anker.ankerVenstre}</span>
                <b>{T.anker.ankerKanVaere}</b>
                <i>{T.anker.ankerBeloeb}</i>
              </div>
              <div className="st-minianker-side st-minianker-pris">
                <span>{T.anker.ankerHoejre}</span>
                <b>£{pris.aar}</b>
                <i>{T.betaling.exVat}</i>
              </div>
            </div>
          </div>

          {/* ─────────── HOEJRE: ACTION-KORTET ───────────
              ⚠️ KORTET LAA FOER UDEN FOR to-kolonnen og faldt derfor ned under
              argumentet i stedet for at staa ved siden af det. DK's /start har
              det i hoejre kolonne, og det er hele grunden til at skaermen
              foeles som eet valg frem for en side man scroller igennem. */}
          <div className="st-pre-hoejre">
            <div className="st-kort">
              <h2 className="st-pre-h2">{T.intro}</h2>
              <p className="st-hj">{T.firmaIntro}</p>
              {fejl && <p className="st-fejl">{fejl}</p>}
              {besked && <p className="st-info">{besked}</p>}
                <span className="st-lab">{T.firma.label}</span>
                <input
                  className="st-felt"
                  value={nummer}
                  onChange={(e) => setNummer(e.target.value)}
                  autoComplete="off"
                  inputMode="text"
                />
                <button className="btn btn-teal st-bred" onClick={slaaOp} disabled={soeger}>
                  {T.cta}
                </button>
                {/* ⚠️ IKKE EN FAGVAELGER — se hovednoten. Med eet fag er det en
                    bekraeftelse, ikke et valg. */}
                <p className="st-hj">{T.firma.udenNummer}</p>
                <button className="st-tilbage" onClick={fortsaetSomRengoering}>
                  {T.firma.soleTrader}
                </button>
              <p className="st-under-knap">{T.trust}</p>
            </div>

            {/* ⚠️ RENDERES KUN NAAR DER ER AEGTE TAL. `tal` er null saa laenge
                GB's dataLever er false - og saa staar blokken der slet ikke.
                Samme regel som forsidens bevis-bjaelke og som DK's egen:
                hellere et hul end et gaettet tal. Hver flise har desuden sin
                egen null-test, saa et manglende felt ikke tager de oevrige med.
                ⚠️ FREKVENS-FLISEN HAENGER MED PAA DE SAMME DATA. "2x a day" er
                sandt om motoren, men den maa ikke staa alene og antyde at der
                koeres paa noget vi ikke har. */}
            {tal && (
              <div className="st-pre-bevis">
                <span className="st-pre-kick">
                  <span className="st-prik" aria-hidden="true" /> {T.bevis.bevisKick}
                </span>
                <div className="st-stats">
                  {tal.bydbare_aabne != null && (
                    <div className="st-stat">
                      <b>{daTal(tal.bydbare_aabne, SPROG)}</b>
                      <span>{ORD.bevis.aabne}</span>
                    </div>
                  )}
                  {tal.nye_7_dage != null && (
                    <div className="st-stat">
                      <b>{daTal(tal.nye_7_dage, SPROG)}</b>
                      <span>{ORD.bevis.nye}</span>
                    </div>
                  )}
                  {tal.bydbare != null && (
                    <div className="st-stat">
                      <b>{daTal(tal.bydbare, SPROG)}</b>
                      <span>{ORD.bevis.bydbare}</span>
                    </div>
                  )}
                  <div className="st-stat">
                    <b>{ORD.bevis.frekvensTal}</b>
                    <span>{ORD.bevis.frekvens}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="st-kort">
        {fejl && <p className="st-fejl">{fejl}</p>}
        {besked && <p className="st-info">{besked}</p>}

        {/* ⚠️ HUSETS EGNE VALG-KOMPONENTER, ikke `st-chip`.
            `.st-chip` er en STATISK visnings-chip med en fjern-knap; den har
            ingen valgt-tilstand. DK bruger `.st-omrk` (flervalg, med
            checkbox) og `.st-valgkort-item` (enkeltvalg) - og den valgte
            tilstand hedder `on`, ikke noget jeg fandt paa. */}
        {navn === "omraade" && (
          <>
            <span className="st-lab">{T.omraade.label}</span>
            <div className="st-omr">
              {regioner.map((r) => (
                <label key={r.key} className={"st-omrk" + (omraader.includes(r.key) ? " on" : "")}>
                  <input
                    type="checkbox"
                    checked={omraader.includes(r.key)}
                    onChange={() =>
                      setOmraader((v) =>
                        v.includes(r.key) ? v.filter((x) => x !== r.key) : [...v, r.key]
                      )
                    }
                  />
                  <span><b>{r.label_da}</b></span>
                </label>
              ))}
            </div>
            <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
          </>
        )}

        {navn === "stoerrelse" && (
          <>
            <span className="st-lab">{T.stoerrelse.label}</span>
            <div className="st-valgkort">
              {T.stoerrelse.baand.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className={"st-valgkort-item" + (baand === b.key ? " on" : "")}
                  aria-pressed={baand === b.key}
                  onClick={() => setBaand(b.key)}
                >
                  <b>{b.label}</b>
                </button>
              ))}
            </div>
            <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
          </>
        )}

        {navn === "type" && (
          <>
            <div className="st-valgkort">
              {[["offentlig", T.type.offentlig], ["privat", T.type.privat], ["begge", T.type.begge]]
                .map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    className={"st-valgkort-item" + (type === k ? " on" : "")}
                    aria-pressed={type === k}
                    onClick={() => setType(k)}
                  >
                    <b>{l}</b>
                  </button>
                ))}
            </div>
            <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
          </>
        )}

        {navn === "kontakt" && (
          <>
            <span className="st-lab">{T.kontakt.firmanavn}</span>
            <input className="st-felt" value={firmanavn} onChange={(e) => setFirmanavn(e.target.value)} />
            <span className="st-lab">{T.kontakt.email}</span>
            <input className="st-felt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <span className="st-lab">{T.kontakt.mobil}</span>
            <input className="st-felt" type="tel" value={mobil} onChange={(e) => setMobil(e.target.value)} />
            <p className="st-hj">{T.kontakt.mobilHjaelp}</p>
            <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
          </>
        )}

        {/* ══ TRIN 3: YOUR MATCHES ══
            ⚠️ AERLIG TOM, IKKE ET OPDIGTET MATCH. Motoren henter nu britiske
            udbud, men GB's `dataLever` er stadig false: bevis-bjaelkens
            paastande ("2x dagligt", "nye de seneste 7 dage") er foerst sande
            naar cron'en har koert af sig selv. Indtil da viser trinnet hvad
            der faktisk sker - at Birdly leder - frem for et tal eller en liste
            vi ikke kan staa inde for. Samme regel som bevis-bjaelken paa
            forsiden: hellere ingenting end noget der ser rigtigt ud.
            Naar dataLever taendes, er det HER de aegte matches skal ind. */}
        {navn === "match" && (
          <>
            <h2 className="st-pre-h2">{T.match.matchOverskrift}</h2>
            <p className="st-hj">{T.match.leder}</p>
            <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
          </>
        )}

        {navn === "betaling" && (
          <>
            {/* ⚠️ KORT-GATEN STOPPER HER, OG DET ER MED VILJE.
                Der er ingen GBP-plan i Frisbii endnu (prices for GB = 0), og
                Frisbii er den AUTORITATIVE priskilde — ikke koden. Prisen
                herunder kommer fra markedsmodellen og er Jonas' beslutning,
                ikke en kurs-omregning. Der traekkes ingen penge, og der
                gemmes ingen tilmelding: `signup` er en skrivesti, og den har
                bevidst ikke preview-doeren. GB er DRAFT. */}
            <p className="st-stat">
              £{pris.maaned}/month · £{pris.aar}/year · {T.betaling.exVat}
            </p>
            <p className="st-hj">{T.trust}</p>
            <p className="st-note">{T.betaling.foersteBetaling}</p>

            {/* ⚠️ KNAPPEN ER STIENS ENDE, IKKE ET LØFTE OM ET TRÆK.
                Den kalder den samme `signup` som Danmark og derefter checkout.
                Begge kan sige nej, og hvert nej har sin egen ærlige tekst
                herunder — ingen af dem er en fejl kunden har lavet. Teksterne
                står IKKE i ordbogen: de beskriver en midlertidig
                driftstilstand, ikke sidens copy, og de forsvinder den dag GB
                åbner. En streng i en.js ville skulle igennem copy-vagten som
                om den var salgstekst. */}
            {!kvittering && (
              <button type="button" className="btn btn-teal" disabled={sender} onClick={tilmeld}>
                {sender ? "Just a moment…" : "Start Birdly"}
              </button>
            )}

            {kvittering === "lukket" && (
              <p className="st-note">
                Birdly is not open for sign-ups in the UK yet. Nothing has been saved
                and you have not been charged.
              </p>
            )}

            {kvittering === "uden-nummer" && (
              <p className="st-note">
                We can&apos;t complete sign-up without a company number yet. If you
                trade without one, email support@getbirdly.co.uk and we&apos;ll sort
                it out with you.
              </p>
            )}

            {kvittering === "mangler-baand" && (
              <p className="st-note">
                We can&apos;t set your contract-size filter yet. Nothing has been
                saved — please try again later.
              </p>
            )}

            {kvittering?.type === "venter-paa-plan" && (
              <p className="st-note">
                Your details are saved. Card payment for the UK isn&apos;t switched on
                yet, so there is nothing to pay today — we&apos;ll email you when it is.
              </p>
            )}

            {kvittering?.type === "checkout" && (
              <p className="st-note">Opening secure checkout…</p>
            )}
          </>
        )}

        {skaerm > 0 && navn !== "betaling" && (
          <button className="st-tilbage" onClick={tilbage}>{T.tilbage}</button>
        )}
      </div>

      {/* Kontekstlinjen: hvad hun har valgt indtil nu. Delene samles og
          adskilles FOERST naar der er mere end een. */}
      <p className="st-hj">
        {[firma?.name, valgtBaand?.label, fag[0]?.label_da].filter(Boolean).join(" · ")}
      </p>
    </main>
  );
}
