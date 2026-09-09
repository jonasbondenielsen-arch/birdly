"use client";

import Link from "next/link";
import { sporCta } from "../../lib/ctaSporing";
import { CTA } from "../../lib/salgTekst";
import { tekster } from "../../lib/tekster";

// ⚠️ DANMARK LÆSER STADIG `CTA` FRA salgTekst.js — IKKE ORDBOGEN.
// Knappen står i dag ~40 steder: headeren, forsiden, /brancher og 36 fag-sider.
// Havde jeg lagt DK's ordlyd om til et ordbogsopslag, ville hver af dem afhænge
// af at ordbogens streng er identisk med salgTekst's — og de to ville kunne
// skride fra hinanden uden at nogen så det. Med den her funktion er DK
// bogstaveligt talt den samme kode som før: `marked` er "DK", og vi rører
// aldrig ordbogen. Kun et ANDET marked slår op.
function ctaTekst(marked, noegle) {
  if (marked === "DK") return CTA[noegle];
  return tekster(marked)?.cta?.[noegle] ?? CTA[noegle];
}

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
export default function Cta({ href, placering, variant = "teal", stor = false, bred = false, children, marked = "DK" }) {
  // ⚠️ "nav" er IKKE en .sg-btn. Header-knappen har sin egen kompakte stil, fordi
  // en fuld knap gør baren for høj på mobil — og den bærer ingen pil, så den ikke
  // konkurrerer visuelt med sidens egentlige CTA'er længere nede.
  if (variant === "nav") {
    return (
      <Link href={href} className="sg-navcta" onClick={() => sporCta(placering, href)}>
        {children || ctaTekst(marked, "primaer")}
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
      {children || ctaTekst(marked, "primaer")} <span aria-hidden="true">→</span>
    </Link>
  );
}

/**
 * Sekundær CTA. ⚠️ ANDEN FUNKTION, ANDET UDSEENDE. Den fører til en forklaring,
 * ikke ind i funnelen, og må aldrig laves om til en teal knap — så konkurrerer
 * to knapper om det samme klik, og den primære taber halvdelen af opmærksomheden.
 */
export function CtaSekundaer({ href = "#hvordan", placering, children, marked = "DK" }) {
  return (
    <Link href={href} className="sg-btn sg-btn-ghost" onClick={() => sporCta(placering, href)}>
      {children || ctaTekst(marked, "sekundaer")}
    </Link>
  );
}
