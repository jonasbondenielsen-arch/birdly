"use client";

import Link from "next/link";
import { sporCta } from "../../lib/ctaSporing";
import { CTA } from "../../lib/salgTekst";

// ============================================================================
// ⚠️ DEN HER KLIENT-KOMPONENT MÅ IKKE IMPORTERE ORDBOGEN. Den gjorde det
// kortvarigt, og det kostede to ting på HVER dansk side — målt 09-09-2026,
// ikke gættet:
//
//   1. lib/tekster/da.js + en.js + markets.js havnede i KLIENT-bundtet. En
//      dansk besøgende hentede altså hele den engelske ordbog med. Det gav to
//      ekstra <script src=…> på /priser og /sadan-virker-det.
//   2. `marked="DK"` blev skrevet ind i RSC-strømmen, fordi HVER prop til en
//      klient-komponent serialiseres. Danske sider flyttede sig af en prop
//      hvis værdi var den samme som standarden.
//
// Løsningen er den samme som for FaqListe: TEKSTEN KOMMER IND SOM DATA.
// Serverkomponenten slår op i ordbogen — den kører alligevel på serveren — og
// sender resultatet med som `tekst`. Sender den ingenting, bruger knappen
// husets danske CTA fra salgTekst.js, præcis som før ordbogen fandtes.
//
// ⚠️ SEND ALDRIG tekst="Find opgaver nu" FRA ET DANSK KALDESTED. Prop'en ville
// lande i RSC-strømmen og flytte DK's bytes, selv med den rigtige streng.
// Dansk = INGEN prop. Se ctaTekst() i Sektioner.js.
// ============================================================================

// ============================================================================
// DEN PRIMÆRE CTA — ét sted, så ordlyden ikke kan drive fra hinanden.
//
// ⚠️ TEKSTEN KOMMER FRA lib/salgTekst.js OG SKRIVES IKKE SOM PROP. Huset har ÉN
// primær CTA ("Find opgaver nu"), og den står i dag i headeren, på forsiden, på
// /brancher og på 36 fag-sider. Fik hver kaldested lov at sende sin egen streng,
// ville vi om et halvt år have fire knapper der ligner hinanden og måler hver
// for sig. Knapper med en ANDEN funktion ("Se hvordan det virker", "Se opgaven",
// opsigelsen) er derfor bevidst en anden komponent-variant.
//
// ⚠️ `placering` ER PÅKRÆVET, og det er ikke pedanteri: det er hele pointen med
// den interne sporing. Uden den ved vi at nogen klikkede, men ikke hvilken af de
// otte knapper der bar dem ind — og så er "flyt CTA'en op" gætværk. Brug korte,
// stabile navne: "hero", "risiko", "motor", "priser-aar", "slut".
//
// Klienten er kun til klik-registreringen. Selve navigationen er et almindeligt
// <Link>, så prefetch og hurtig rutning virker som alle andre steder.
// ============================================================================
export default function Cta({ href, placering, variant = "teal", stor = false, bred = false, children, tekst = null }) {
  // ⚠️ "nav" er IKKE en .sg-btn. Header-knappen har sin egen kompakte stil, fordi
  // en fuld knap gør baren for høj på mobil — og den bærer ingen pil, så den ikke
  // konkurrerer visuelt med sidens egentlige CTA'er længere nede.
  if (variant === "nav") {
    return (
      <Link href={href} className="sg-navcta" onClick={() => sporCta(placering, href)}>
        {children || tekst || CTA.primaer}
      </Link>
    );
  }

  const klasse = [
    "sg-btn",
    variant === "ghost" ? "sg-btn-ghost" : variant === "hvid" ? "sg-btn-hvid" : "sg-btn-teal",
    stor ? "sg-btn-stor" : "",
    bred ? "sg-btn-bred" : "",
  ].filter(Boolean).join(" ");

  return (
    <Link href={href} className={klasse} onClick={() => sporCta(placering, href)}>
      {children || tekst || CTA.primaer} <span aria-hidden="true">→</span>
    </Link>
  );
}

/**
 * Sekundær CTA. ⚠️ ANDEN FUNKTION, ANDET UDSEENDE. Den fører til en forklaring,
 * ikke ind i funnelen, og må aldrig laves om til en teal knap — så konkurrerer
 * to knapper om det samme klik, og den primære taber halvdelen af opmærksomheden.
 */
export function CtaSekundaer({ href = "#hvordan", placering, children, tekst = null }) {
  return (
    <Link href={href} className="sg-btn sg-btn-ghost" onClick={() => sporCta(placering, href)}>
      {children || tekst || CTA.sekundaer}
    </Link>
  );
}
