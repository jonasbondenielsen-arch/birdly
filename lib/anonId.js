"use client";

import { maa } from "./samtykke";

// ============================================================================
// ANONYMT ID — Birdlys eget førsteparts-id for en besøgende.
//
// ⚠️ DET ER TILFÆLDIGT, IKKE UDLEDT. Ingen hash af mail, CVR, IP eller
// user-agent. Et udledt id ville være en pseudonymisering af persondata og
// dermed stadig persondata — og to personer med samme browser ville få samme id.
// 128 tilfældige bit fra `crypto`, og intet andet.
//
// ⚠️ FORMEN ER AFTALT MED SERVEREN. `b` + 32 hex-tegn. Edge Function'en `spor`
// afviser alt andet, netop så et forsøg på at sende en mailadresse som "anon_id"
// bliver afvist frem for at blive til en permanent, append-only række.
//
// ⚠️ localStorage, IKKE sessionStorage — og det er en anden beslutning end
// attributionens. Attributionen hører til ÉT besøg (lib/attribution.js): en
// kunde der vender tilbage om tre uger er ikke længere annoncens fortjeneste.
// Men det er stadig den samme besøgende, og tragten "landede mandag, tilmeldte
// sig torsdag" kan kun måles hvis id'et overlever fanen.
//
// ⚠️ BAG STATISTIK-SAMTYKKET, samme gate som sporFunnel. Uden samtykke oprettes
// der intet id og gemmes ingenting — funktionen returnerer null, og kalderne
// sender så ikke noget. Det er derfor gaten står HER og ikke hos kalderne.
//
// ⚠️ MÅ ALDRIG KASTE. Privat browsing, fuld kvote og blokeret storage er alle
// normale tilstande. Mister vi id'et, mister vi en måling — ikke en kunde.
// ============================================================================

const NOEGLE = "birdly_anon";

function nyt() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return "b" + [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Den besøgendes anonyme id. Oprettes ved første kald.
 * @returns {string|null} null hvis der ikke er statistik-samtykke, eller hvis
 *                        browseren ikke vil gemme noget.
 */
export function hentAnonId() {
  try {
    if (typeof window === "undefined") return null;
    if (!maa("statistik")) return null;

    const gemt = window.localStorage.getItem(NOEGLE);
    // ⚠️ FORMEN TJEKKES OGSÅ VED LÆSNING. Et id fra en tidligere version, eller
    // noget en bruger selv har skrevet i konsollen, ville ellers blive sendt af
    // sted og afvist af serveren ved hver eneste hændelse i resten af besøget.
    if (gemt && /^b[0-9a-f]{32}$/.test(gemt)) return gemt;

    const id = nyt();
    window.localStorage.setItem(NOEGLE, id);
    return id;
  } catch {
    return null;
  }
}

/**
 * Fjerner id'et. Kaldes når statistik-samtykket trækkes tilbage — ellers ville
 * et id fra før tilbagetrækningen ligge og vente på næste gang samtykket gives,
 * og så ville de to perioder blive knyttet sammen.
 */
export function ryddAnonId() {
  try {
    window.localStorage.removeItem(NOEGLE);
  } catch { /* intet at rydde */ }
}
