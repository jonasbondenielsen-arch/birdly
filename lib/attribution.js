"use client";

import { maa } from "./samtykke";

// ============================================================================
// ATTRIBUTION — hvor kom kunden fra.
//
// Parametrene står kun i URL'en på landingssiden. Funnel'en er fire trin med
// klient-navigation, og Reepay-modalen lægger sig ovenpå — så er ?utm_campaign for
// længst væk fra adresselinjen. Derfor gemmes de ved landing og læses igen ved
// tilmelding.
//
// FØRSTE berøring vinder: ser vi allerede en kampagne denne session, overskriver et
// senere besøg den ikke. Ellers ville en kunde der klikker en annonce, går på Google og
// finder os igen, blive krediteret organisk søgning — og annoncen ville se død ud.
//
// sessionStorage, ikke localStorage: attributionen hører til ÉT besøg. En kunde der
// vender tilbage om tre uger er ikke længere den annonces fortjeneste.
// ============================================================================

const NOEGLE = "birdly_attribution"; // samme nøgle som ryddMarketing() i samtykke.js

// Almindelige UTM'er. Ikke personhenførbare i sig selv — de siger noget om annoncen,
// ikke om personen — og gemmes derfor uden marketing-samtykke.
const UTM_FELTER = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "hook"];

// ⚠️ Metas klik- og annonce-id'er. fbclid kan hos Meta føres tilbage til en bestemt
// person og er dermed persondata. Den gemmes KUN hvis marketing-samtykket er givet.
const MARKETING_FELTER = ["fbclid", "campaign_id", "adset_id", "ad_id"];

function laes() {
  try {
    const raa = window.sessionStorage.getItem(NOEGLE);
    return raa ? JSON.parse(raa) : {};
  } catch {
    return {};
  }
}

/** Attributionen som den skal med på tilmeldingen. Tomt objekt ⇒ ingen kampagne. */
export function hentAttribution() {
  if (typeof window === "undefined") return {};
  return laes();
}

/**
 * Læser parametre fra den aktuelle URL og gemmer dem. Kaldes ved landing OG igen når
 * samtykket ændrer sig — fbclid står stadig i adresselinjen få sekunder senere, når
 * kunden har trykket "Accepter alle", og skal først da må gemmes.
 */
export function fangAttribution() {
  if (typeof window === "undefined") return {};

  const q = new URLSearchParams(window.location.search);
  const gemt = laes();
  const opdateret = { ...gemt };
  let aendret = false;

  const saet = (navn, vaerdi) => {
    if (!vaerdi) return;
    if (opdateret[navn]) return; // første berøring vinder
    opdateret[navn] = String(vaerdi).slice(0, 200);
    aendret = true;
  };

  for (const f of UTM_FELTER) saet(f, q.get(f));
  if (maa("marketing")) for (const f of MARKETING_FELTER) saet(f, q.get(f));

  // Landingssiden og tidspunktet giver kampagnetallene mening bagefter. Kun sat én gang,
  // og kun hvis der faktisk var en kampagne at kreditere.
  if (aendret && !opdateret.landing) {
    opdateret.landing = window.location.pathname.slice(0, 200);
    opdateret.ts = new Date().toISOString();
  }

  if (!aendret) return gemt;
  try {
    window.sessionStorage.setItem(NOEGLE, JSON.stringify(opdateret));
  } catch { /* privat browsing — så mistes attributionen, og det er i orden */ }
  return opdateret;
}
