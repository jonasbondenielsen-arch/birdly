"use client";

import { useState } from "react";
import { daTal } from "../lib/opgaveTal";

// ============================================================================
// OPGAVE-TÆLLER — slank bar under menuen med det levende antal.
//
// Klient-komponent, fordi branchevælgeren skifter tallet uden en genindlæsning.
// Selve tallene er hentet SERVER-side og sendes med som prop — så står de i HTML'en
// ved load (godt for Google og for den der har langsomt net), og der er ingen
// blinkende tom bar mens noget hentes.
//
// ⚠️ PLACERING: ligger inde i .topstack sammen med headeren (z-index 90), så den
// følger med ned ved scroll UDEN at jeg indfører et nyt lag. Samtykke-banneret (90)
// og sticky-CTA'en (80) sidder begge i BUNDEN — ingen kollision. Det var netop den
// slags overlap der fik chat-knappen til at dække "Accepter alle".
//
// ⚠️ INTET TAL ⇒ INGEN BAR. Har serveren ikke kunnet hente tal, renderer vi ingenting
// frem for en bar der siger "0 opgaver". Et dødt tal er værre end ingen tæller.
// ============================================================================
export default function OpgaveTaeller({ tal, brancher = [], valgtFag = null, valgtLabel = null, kompakt = false }) {
  const [fag, setFag] = useState(valgtFag);

  if (!tal || typeof tal.i_alt !== "number") return null;

  const antal = fag ? (tal.pr_branche?.[fag] ?? null) : tal.i_alt;
  // valgtLabel bruges hvor der ikke er en vælger (branchesiderne kender allerede faget).
  const valgt = brancher.find((b) => b.fagKey === fag) || (fag && valgtLabel ? { label: valgtLabel } : null);

  return (
    <div className={"opgtal" + (kompakt ? " opgtal-kompakt" : "")}>
      <div className="opgtal-inner">
        <span className="opgtal-prik" aria-hidden="true" />
        <span className="opgtal-tekst">
          Vi holder øje med{" "}
          <b>{antal == null ? "—" : `${daTal(antal)} ${antal === 1 ? "opgave" : "opgaver"}`}</b>{" "}
          {valgt ? <>i {valgt.label.toLowerCase()}</> : "lige nu"}
        </span>
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
