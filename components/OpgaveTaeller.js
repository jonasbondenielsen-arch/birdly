"use client";

import { useState } from "react";
import { daTal, rundNed } from "../lib/opgaveTal";

// ============================================================================
// OPGAVE-TÆLLER — bar under menuen med det levende tal.
//
// Klient-komponent, fordi branchevælgeren (kun hvor den bruges) skifter tallet uden
// genindlæsning. Selve tallene hentes SERVER-side og sendes med som prop, så de står
// i HTML'en ved load — ingen blinkende tom bar, og Google ser dem.
//
// ⚠️ PLACERING: ligger inde i .topstack sammen med headeren (z-index 90), så den
// følger med ned ved scroll UDEN et nyt lag. Samtykke-banner (90) og sticky-CTA (80)
// sidder begge i BUNDEN — ingen kollision.
//
// ⚠️ INTET TAL ⇒ INGEN BAR. Har serveren ikke kunnet hente tal, renderer vi ingenting
// frem for "0 opgaver". Et dødt tal er værre end ingen tæller.
// ============================================================================
export default function OpgaveTaeller({
  tal,
  brancher = [],
  valgtFag = null,
  valgtLabel = null,
  kompakt = false,
  // "stort" = forsidens variant: ét stort tal, ingen vælger, tallet som visuel helt.
  variant = "stort",
}) {
  const [fag, setFag] = useState(valgtFag);

  if (!tal) return null;

  const erStort = variant === "stort";
  // Forsiden viser alle bydbare rundet ned ("over 400"); fag-siderne viser fagets
  // eget, præcise tal.
  const raat = erStort ? tal.bydbare : fag ? tal.pr_branche?.[fag] : tal.i_alt;
  if (typeof raat !== "number") return null;

  const valgt = brancher.find((b) => b.fagKey === fag) || (fag && valgtLabel ? { label: valgtLabel } : null);

  return (
    <div className={"opgtal" + (kompakt ? " opgtal-kompakt" : "") + (erStort ? " opgtal-stort" : "")}>
      <div className="opgtal-inner">
        <span className="opgtal-prik" aria-hidden="true" />
        {erStort ? (
          <span className="opgtal-tekst">
            Vi har netop <b className="opgtal-num">over {daTal(rundNed(raat))}</b> opgaver klar til at blive budt på
          </span>
        ) : (
          <span className="opgtal-tekst">
            Vi holder øje med <b>{daTal(raat)} {raat === 1 ? "opgave" : "opgaver"}</b>{" "}
            {valgt ? <>i {valgt.label.toLowerCase()}</> : "lige nu"}
          </span>
        )}
        {brancher.length > 0 && (
          <label className="opgtal-vaelg">
            <span className="visually-hidden">Vælg branche</span>
            <select value={fag || ""} onChange={(e) => setFag(e.target.value || null)}>
              <option value="">Alle brancher</option>
              {brancher.map((b) => (
                <option key={b.fagKey} value={b.fagKey}>{b.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
