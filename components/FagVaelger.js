"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { soegFag } from "../lib/fagSoeg";

// ============================================================================
// SØGBAR FAG-VÆLGER — erstatter 22 chips der fyldte en halv mobilskærm.
//
// ⚠️ DEN GEMMER FAG-KODEN, ALDRIG SØGETEKSTEN. `onSkift` får nøgler fra kataloget
// (tomrer, murer, …). Sendte vi hendes egne ord videre, ville opgaven blive oprettet
// under et fag der ikke findes, og matchmotoren ville aldrig finde en eneste
// virksomhed. Der er derfor ingen "opret dit eget fag"-vej her, og der skal ikke være.
//
// ⚠️ INGEN AUTOCOMPLETE-BIBLIOTEK. 21 fag søges på mikrosekunder i en løkke. Et
// bibliotek ville koste kilobytes før hun overhovedet kan skrive — og hun sidder på
// mobildata, kommet fra en annonce.
//
// ⚠️ TASTATURET MÅ IKKE SPÆRRE FOR RESULTATERNE. På mobil åbner tastaturet og dækker
// den nederste halvdel; derfor står forslagene UNDER feltet i normal flow (ikke som
// et absolut positioneret overlay), så siden kan rulle dem frem.
// ============================================================================

export default function FagVaelger({ fagListe, valgte, onSkift, andetValgt, onAndet, id = "oo-fag" }) {
  const [q, setQ] = useState("");
  const [aaben, setAaben] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const boks = useRef(null);

  const forslag = useMemo(
    () => (q.trim() ? soegFag(q, fagListe, valgte, 6) : []),
    [q, fagListe, valgte]
  );

  // Klik udenfor lukker listen. Uden det ville forslagene blive hængende over
  // resten af formularen på mobil.
  useEffect(() => {
    if (!aaben) return;
    const ud = (e) => { if (boks.current && !boks.current.contains(e.target)) setAaben(false); };
    document.addEventListener("mousedown", ud);
    document.addEventListener("touchstart", ud);
    return () => {
      document.removeEventListener("mousedown", ud);
      document.removeEventListener("touchstart", ud);
    };
  }, [aaben]);

  useEffect(() => { setAktiv(0); }, [q]);

  function vaelg(key) {
    onSkift(key);
    // ⚠️ FELTET RYDDES EFTER ET VALG. Hun skal kunne skrive det næste fag med det
    // samme; stod hendes forrige søgning tilbage, skulle hun slette den først.
    setQ("");
    setAaben(false);
  }

  const valgteFag = (valgte || [])
    .map((k) => fagListe.find((f) => f.key === k))
    .filter(Boolean);

  return (
    <div ref={boks} className="fv">
      {/* Valgte fag står ØVERST, så hun kan se hvad hun har valgt uden at scrolle
          forbi et søgefelt der ser tomt ud. */}
      {(valgteFag.length > 0 || andetValgt) && (
        <div className="fv-valgte">
          {valgteFag.map((f) => (
            <button type="button" key={f.key} className="fv-chip" onClick={() => onSkift(f.key)}
              aria-label={`Fjern ${f.label_da || f.key}`}>
              {f.label_da || f.label || f.key}<span aria-hidden="true">×</span>
            </button>
          ))}
          {andetValgt && (
            <button type="button" className="fv-chip" onClick={onAndet} aria-label="Fjern Andet">
              Andet<span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      )}

      <input
        id={id}
        className="st-felt fv-input"
        type="text"
        // ⚠️ IKKE type="search": Safari lægger sit eget ryd-kryds og en anden
        // tastaturknap på, og det kolliderer med vores egen liste.
        autoComplete="off"
        // ⚠️ EKSEMPLER, IKKE EN INSTRUKTION. "Søg efter fag eller service" beskriver
        // feltet; "Søg fx tømrer, murer, rengøring" viser at hun må skrive i
        // hverdagssprog - og at listen også dækker service, ikke kun håndværk.
        placeholder="Søg fx tømrer, murer, rengøring…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setAaben(true); }}
        onFocus={() => setAaben(true)}
        onKeyDown={(e) => {
          if (!forslag.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setAktiv((i) => Math.min(i + 1, forslag.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setAktiv((i) => Math.max(i - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); vaelg(forslag[aktiv].key); }
          else if (e.key === "Escape") setAaben(false);
        }}
        role="combobox"
        aria-expanded={aaben && forslag.length > 0}
        aria-controls={`${id}-liste`}
        aria-autocomplete="list"
      />

      {aaben && q.trim() && (
        <ul className="fv-liste" id={`${id}-liste`} role="listbox">
          {forslag.map((f, i) => (
            <li key={f.key} role="option" aria-selected={i === aktiv}>
              <button type="button" className={"fv-forslag" + (i === aktiv ? " on" : "")}
                onMouseEnter={() => setAktiv(i)}
                onClick={() => vaelg(f.key)}>
                {f.label_da || f.label || f.key}
              </button>
            </li>
          ))}
          {/* ⚠️ "ANDET" ER SIDSTE UDVEJ, IKKE ET FAG. Den åbner et fritekstfelt og
              sender INGEN fag-nøgle med — se noten i OpretOpgave.js. Den vises kun
              når søgningen ikke fandt noget, så hun ikke vælger den af dovenskab og
              dermed gør opgaven umatchbar. */}
          {forslag.length === 0 && (
            <li>
              <div className="fv-tom">
                Ingen fag matcher &ldquo;{q.trim()}&rdquo;.
                {!andetValgt && (
                  <> <button type="button" className="fv-andet" onClick={() => { onAndet(); setQ(""); setAaben(false); }}>
                    Beskriv det selv
                  </button></>
                )}
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
