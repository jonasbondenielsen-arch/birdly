"use client";

import { maa } from "./samtykke";

// ============================================================================
// META PIXEL — bag samtykket, altid.
//
// ⚠️ Rækkefølgen er hele pointen. Den almindelige fejl er at lægge pixel-scriptet i
// layoutet og derefter "respektere" valget bagefter — men da har scriptet allerede sat
// _fbp og allerede sendt et PageView. Her findes scriptet slet ikke i DOM'en før
// samtykket er givet, og spor() tjekker samtykket igen ved HVERT kald: bliver samtykket
// trukket tilbage midt i funnel'en, holder vi op med at sende, selv om fbq stadig
// ligger i hukommelsen fra før.
//
// Pixel-id'et er offentligt (det står i enhver netværkslog) og hører derfor til i
// NEXT_PUBLIC_. Mangler det, gør hele filen ingenting — så kan siden køre lokalt og i
// preview uden at forurene tallene med testtrafik.
// ============================================================================

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function harPixel() {
  return !!PIXEL_ID;
}

/** Lægger fbq-stubben og scriptet ind. Idempotent — kan kaldes flere gange. */
export function indlaesPixel() {
  if (!PIXEL_ID || typeof window === "undefined") return;
  if (!maa("marketing")) return; // dobbelt værn: kaldes kun med samtykke, men vi tjekker igen
  if (window.fbq) return;

  // Metas egen stub, skrevet ud i stedet for at blive indsat som rå HTML.
  const n = (window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  s.id = "birdly-meta-pixel";
  document.head.appendChild(s);

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

/**
 * Fjerner pixel'en igen ved tilbagekaldt samtykke. Cookierne ryddes af samtykke.js;
 * her fjernes selve scriptet og fbq, så der ikke kan sendes mere. Uden dette ville et
 * tilbagekald kun betyde "vi lover at lade være" — fbq lå stadig og kunne kalde hjem.
 */
export function fjernPixel() {
  if (typeof window === "undefined") return;
  try {
    const s = document.getElementById("birdly-meta-pixel");
    if (s) s.remove();
    delete window.fbq;
    delete window._fbq;
  } catch { /* ligegyldigt — spor() spærrer alligevel uden samtykke */ }
}

/**
 * Sender en hændelse — men kun hvis samtykket stadig gælder OG pixel'en faktisk er
 * indlæst. Må aldrig kaste: et måletal er aldrig vigtigere end at kunden kommer
 * igennem betalingen.
 */
export function spor(navn, data) {
  try {
    if (!PIXEL_ID || typeof window === "undefined") return;
    if (!maa("marketing")) return;
    if (typeof window.fbq !== "function") return;
    window.fbq("track", navn, data || {});
  } catch { /* måling må aldrig vælte funnel'en */ }
}
