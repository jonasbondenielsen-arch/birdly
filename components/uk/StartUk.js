"use client";

import { useMemo, useState } from "react";
import { Logo } from "../Logo";
import { tekster } from "../../lib/tekster";
import "../../app/start.css";

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

const SKAERME = ["firma", "omraade", "stoerrelse", "type", "kontakt", "betaling"];

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

export default function StartUk({ katalog, pris, hjem }) {
  const T = tekster("GB").funnel;
  const [skaerm, setSkaerm] = useState(0);
  const [fejl, setFejl] = useState(null);

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

  return (
    <div className="st" lang="en-GB">
      <div className="st-top">
        <Logo height={30} />
        <a className="st-tilbage-link" href={hjem}>{T.tilbage}</a>
      </div>

      <div className="st-wrap">
        <div className="st-kort">
          {fejl && <p className="st-fejl">{fejl}</p>}
          {besked && <p className="st-info">{besked}</p>}

          {navn === "firma" && (
            <>
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
              {/* ⚠️ IKKE EN FAGVÆLGER — se hovednoten. Med ét fag er det en
                  bekræftelse, ikke et valg. */}
              <p className="st-hj">{T.firma.udenNummer}</p>
              <button className="st-tilbage" onClick={fortsaetSomRengoering}>
                {T.firma.soleTrader}
              </button>
            </>
          )}

          {navn === "omraade" && (
            <>
              <span className="st-lab">{T.omraade.label}</span>
              <div className="st-chips">
                {regioner.map((r) => (
                  <button
                    key={r.key}
                    className={"st-chip" + (omraader.includes(r.key) ? " st-aktiv" : "")}
                    onClick={() =>
                      setOmraader((v) =>
                        v.includes(r.key) ? v.filter((x) => x !== r.key) : [...v, r.key]
                      )
                    }
                  >
                    {r.label_da}
                  </button>
                ))}
              </div>
              <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
            </>
          )}

          {navn === "stoerrelse" && (
            <>
              <span className="st-lab">{T.stoerrelse.label}</span>
              <div className="st-chips">
                {T.stoerrelse.baand.map((b) => (
                  <button
                    key={b.key}
                    className={"st-chip" + (baand === b.key ? " st-aktiv" : "")}
                    onClick={() => setBaand(b.key)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-teal st-bred" onClick={naeste}>{T.cta}</button>
            </>
          )}

          {navn === "type" && (
            <>
              <div className="st-chips">
                {[["offentlig", T.type.offentlig], ["privat", T.type.privat], ["begge", T.type.begge]]
                  .map(([k, l]) => (
                    <button
                      key={k}
                      className={"st-chip" + (type === k ? " st-aktiv" : "")}
                      onClick={() => setType(k)}
                    >
                      {l}
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

          {navn === "betaling" && (
            <>
              {/* ⚠️ KORT-GATEN STOPPER HER, OG DET ER MED VILJE.
                  Der er ingen GBP-plan i Frisbii endnu (prices for GB = 0), og
                  Frisbii er den AUTORITATIVE priskilde — ikke koden. Prisen
                  herunder kommer fra markedsmodellen og er Jonas' beslutning,
                  ikke en kurs-omregning. Der trækkes ingen penge, og der
                  gemmes ingen tilmelding: `signup` er en skrivesti, og den har
                  bevidst ikke preview-døren. GB er DRAFT. */}
              <p className="st-stat">
                £{pris.maaned}/month · £{pris.aar}/year · {T.betaling.exVat}
              </p>
              <p className="st-hj">{T.trust}</p>
              <p className="st-note">{T.betaling.foersteBetaling}</p>
            </>
          )}

          {skaerm > 0 && navn !== "betaling" && (
            <button className="st-tilbage" onClick={tilbage}>{T.tilbage}</button>
          )}
        </div>

        {/* Kontekstlinjen: hvad hun har valgt indtil nu. Delene samles og
            adskilles FØRST når der er mere end én — ellers stod der en løs
            prik før det første ord. */}
        <p className="st-hj">
          {[firma?.name, valgtBaand?.label, fag[0]?.label_da].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}
