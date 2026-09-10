"use client";

import { useEffect } from "react";

// ============================================================================
// SÆTTER <html lang> EFTER MOUNT.
//
// ⚠️ DEN FINDES FORDI ROD-LAYOUTET IKKE KAN VIDE HVILKET MARKED DET ER.
// `<html lang="da">` sættes i app/layout.js, som er FÆLLES for begge markeder.
// Skulle det være markedsafhængigt server-side, skulle layoutet læse
// x-birdly-marked via headers() — og så bliver HVER dansk side dynamisk og
// mister sin cache. Den pris er for høj.
//
// ⚠️ DET ER EN HALV LØSNING, OG DET SKAL STÅ KLART. Den server-renderede HTML
// siger stadig lang="da" på de britiske sider; først efter hydrering retter
// den sig. En skærmlæser der læser den færdige side får en-GB, men en crawler
// der kun ser kilden får da. Den fulde løsning er to root-layouts via
// route groups — en større ombygning af hver eneste danske rute, og den hører
// ikke til i en juraside-opgave. Flagget til Jonas.
// ============================================================================
export default function SaetLang({ lang }) {
  useEffect(() => {
    const foer = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = foer; };
  }, [lang]);
  return null;
}
