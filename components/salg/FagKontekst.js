"use client";

import { createContext, useContext, useMemo, useState } from "react";

// ============================================================================
// DET VALGTE FAG — delt mellem bevis-sektionen og værdi-ankeret.
//
// ⚠️ HVORFOR DER OVERHOVEDET SKAL EN KONTEKST TIL. Vælger en besøgende "VVS" i
// bevis-sektionen, skal regnestykket længere nede skifte med: en VVS'er skal
// ikke se en rengøringsaftale på 8.000 kr./md. som sit eksempel. De to sektioner
// er adskilt af tre andre sektioner, så en fælles forælder-state ville betyde at
// halvdelen af siden blev klient-renderet uden grund.
//
// Konteksten løser det: kun de to sektioner der FAKTISK afhænger af faget bliver
// klienter. Alt derimellem — problem, motor, SMS, portal — forbliver
// server-renderet og koster ingen JavaScript.
//
// ⚠️ STARTVÆRDIEN KOMMER FRA ADRESSEN, MEN ER VALIDERET FØRST. Provideren får en
// fagnøgle der allerede er slået op i BRANCHER (se Salgsside.js). Vi lægger
// ALDRIG en rå ?fag=-værdi herind: den styrer både overskrifter og hvilket
// regnestykke der vises, og en tilfældig streng i adressen må ikke kunne gøre
// nogen af delene.
// ============================================================================

const FagCtx = createContext(null);

export function FagProvider({ start = "rengoring", children }) {
  const [fag, setFag] = useState(start);
  // Uden memo får hver forbruger et nyt objekt ved hver render af provideren.
  const vaerdi = useMemo(() => ({ fag, setFag }), [fag]);
  return <FagCtx.Provider value={vaerdi}>{children}</FagCtx.Provider>;
}

/**
 * Læs/sæt det valgte fag.
 *
 * ⚠️ FALDER TILBAGE FREM FOR AT KASTE. Bruges en af sektionerne uden for
 * provideren — fx på en fag-side der kun vil have beviset — skal den stadig
 * virke. Da er faget bare fast, og setFag er et no-op.
 */
export function useFag(fald = "rengoring") {
  const ctx = useContext(FagCtx);
  return ctx || { fag: fald, setFag: () => {} };
}
