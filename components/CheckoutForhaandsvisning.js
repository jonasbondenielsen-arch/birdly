"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { PLAN, TRIAL_DAYS, YEARLY_SAVING, priceText } from "../lib/pakke";
import "../app/tilmeld.css";
import "../app/checkout-forhaandsvisning.css";

// ============================================================================
// /checkout-forhaandsvisning — 1:1 replika af betalingstrinnet, til Clearhaus.
//
// ⚠️ DEN KAN IKKE TRÆKKE PENGE, og det er ikke en indstilling man kan komme til at
// slå fra. Filen indlæser IKKE checkout.reepay.com/checkout.js, kalder IKKE
// create-subscription-session, og har INGEN submit-handler. Der findes ingen kodesti
// herfra til Frisbii. Tilføj aldrig en.
//
// ⚠️ REPLIKAEN SPEJLER /start (Start.js trin 5) — IKKE Tilmeld.js.
// Rettet 21-08-2026: /tilmeld er permanent redirectet til /kom-i-gang i
// next.config.mjs og er uopnåelig for kunder. Første udgave af denne side spejlede
// Tilmeld.js, altså en død fil — og havde Clearhaus godkendt den, ville de have
// godkendt en side ingen kunde kan nå.
//
// ⚠️ ORDLYDEN SKAL STEMME ORDRET MED Start.js trin 5. Layoutet må gerne afvige
// (funnelen har fem trin, dette er én side), men teksterne om pris, prøveperiode,
// fornyelse, opsigelse og fortrydelsesret skal være identiske. Ændrer du den ene,
// skal du ændre den anden — ellers viser vi indløseren noget andet end kunden møder.
//
// CSS'en er stadig tilmeld.css: den er scoped under .birdly-tilmeld og giver de
// visuelle byggeklodser (.card, .plans, .plan, .submit, .consent). Det er
// TEKSTERNE der skal matche /start, ikke pixelplaceringen.
//
// ⚠️ PRISEN KOMMER FRA lib/pakke.js — samme kilde som funnelen. Aldrig hardkodet:
// et tal skrevet af her ville kunne blive stående efter en prisændring, og så ville
// Clearhaus have godkendt en pris vi ikke opkræver.
//
// ⚠️ FRISBII-FELTERNE ER EN MÆRKET PLADSHOLDER, ikke en tegning. En attrap af
// kortformularen ville vise Clearhaus noget der ikke findes — og de skal kunne stole
// på at det de ser, er det kunden møder. Frisbii's iframe er PCI-området; vi ejer
// alt uden om den.
//
// ⚠️ FIRE AF DE SYV OPLYSNINGER FINDES ENDNU IKKE I DEN RIGTIGE FUNNEL (punkt 1, 3,
// 4 og 7 — se noterne nedenfor). De står her, fordi Clearhaus kræver dem. Den rigtige
// checkout skal have de samme tilføjelser FØR go-live; ellers er godkendelsen bygget
// på noget der ikke findes. Det er en separat beslutning, der rører den live funnel.
// ============================================================================

export default function CheckoutForhaandsvisning() {
  const [billing, setBilling] = useState("yearly");
  const pris = billing === "yearly" ? priceText.yearly : priceText.monthly;
  // ⚠️ "hvert år", ikke "hver år". "hver" bøjes efter køn: hver måned (fælleskøn),
  // hvert år (intetkøn). Ordet står fire steder på siden, så bøjningen følger med
  // intervallet frem for at blive skrevet i hånden hvert sted.
  const hverFrekvens = billing === "yearly" ? "hvert år" : "hver måned";


  return (
    <div className="birdly-tilmeld cfv">
      <header>
        <div className="bar">
          <Logo height={30} />
          <span className="cfv-maerkat">Forhåndsvisning — ikke en aktiv betalingsside</span>
        </div>
      </header>

      <div className="wrap" style={{ paddingTop: 26, paddingBottom: 60 }}>
        {/* ⚠️ BANNERET ER IKKE PYNT. Enhver der åbner linket — også internt — skal på
            første skærm forstå at der ikke kan gennemføres en betaling her. */}
        <div className="cfv-banner">
          <b>Dette er en forhåndsvisning af Birdlys betalingsside.</b> Siden er bygget til
          gennemsyn og kan ikke gennemføre en betaling eller oprette et abonnement. Den er
          ikke en del af tilmeldingsflowet og kan ikke nås fra birdly.dk.
        </div>

        <div className="card">
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>Vælg dit abonnement</h1>
          <p className="sub">Gratis prøveperiode · du betaler intet i dag · opsig når som helst inden.</p>

          {/* ── CLEARHAUS 1: VIRKSOMHEDSNAVN ──
              ⚠️ FINDES IKKE I DEN RIGTIGE FUNNEL I DAG. Det står kun i footeren.
              Clearhaus kræver at sælger er identificeret dér hvor kortet indtastes. */}
          <div className="cfv-saelger">
            <div className="cfv-saelger-navn">Birdly.dk</div>
            <div className="cfv-saelger-info">CVR 35764283 · Fjordvej 4, 4300 Holbæk, Danmark</div>
            <div className="cfv-saelger-info">support@birdly.dk</div>
          </div>

          {/* ── CLEARHAUS 2: BESKRIVELSE AF YDELSEN ──
              ⚠️ I den rigtige funnel står her kun en recap af kundens EGNE valg
              ("Tømrer · Sjælland · SMS + e-mail"). Det siger hvad hun valgte, ikke
              hvad hun køber. Clearhaus skal kunne se ydelsen beskrevet. */}
          <div className="cfv-ydelse">
            <div className="bredde-q">Hvad abonnementet giver adgang til</div>
            <p>
              Birdly overvåger danske offentlige udbud og sender dig besked, når der er en
              opgave, der passer til dit fag, dit område og din opgavestørrelse. Du får
              beskeder på SMS og e-mail, adgang til din personlige opgaveliste med alle
              dine matches, og en bud-skabelon til de opgaver, du vil byde på.
            </p>
            <p className="sub" style={{ marginTop: 6 }}>
              Digital abonnementstjeneste. Leveres straks ved oprettelse.
            </p>
          </div>

          {/* Plan-toggle — nøjagtig samme markup og klasser som Tilmeld.js trin 4. */}
          <div className="plans plans-2" role="radiogroup" aria-label="Vælg betalingsinterval">
            <label className={"plan" + (billing === "monthly" ? " on" : "")}>
              <input type="radio" name="billing" checked={billing === "monthly"} onChange={() => setBilling("monthly")} />
              <div className="nm">Månedlig</div>
              <div className="pr">{PLAN.monthly.toLocaleString("da-DK")}<span> kr./md</span></div>
              <div className="ds">ex. moms</div>
            </label>
            <label className={"plan" + (billing === "yearly" ? " on" : "")}>
              <span className="feat">Spar {YEARLY_SAVING.pct}%</span>
              <input type="radio" name="billing" checked={billing === "yearly"} onChange={() => setBilling("yearly")} />
              <div className="nm">Årlig</div>
              <div className="pr">{PLAN.yearly.toLocaleString("da-DK")}<span> kr./år</span></div>
              <div className="ds">ex. moms · forudbetalt</div>
            </label>
          </div>

          {/* ── CLEARHAUS 3, 6 og 7: STARTDATO + VARIGHED, FREKVENS, OPSIGELSE ──
              Ordlyden er Jonas'. Prisen følger den valgte plan og kommer fra
              lib/pakke.js — den kan ikke komme til at stå forkert efter en
              prisændring. */}
          <div className="cfv-abon">
            <div className="cfv-abon-h">Sådan fungerer betalingen</div>
            <p>
              Abonnementet starter <b>i dag</b> med <b>{TRIAL_DAYS} dages gratis prøveperiode</b>.
              Du betaler <b>0 kr. i dag</b>. {TRIAL_DAYS === 14 ? "3" : "3"} dage før prøveperioden
              udløber, sender vi dig en påmindelse. Herefter fortsætter medlemskabet
              automatisk til <b>{pris} ex. moms</b> og fornyes løbende {hverFrekvens},{" "}
              <b>indtil du opsiger</b>. Du kan til enhver tid opsige med virkning fra næste
              betalingsperiode.
            </p>
            {/* ⚠️ FORTRYDELSESRET OG REFUSION STÅR I HVER SIT DOKUMENT — verificeret:
                refusionsreglen i abonnementsbetingelserne §4.4, fortrydelsesretten i
                handelsbetingelserne §1.3. Linker vi kun til det ene, peger siden på
                noget svagere end den lover.

                ⚠️ "Ingen fortrydelsesret" er IKKE en mangel, det er et faktum om
                aftaletypen: tjenesten sælges udelukkende B2B, og
                forbrugerfortrydelsesretten gælder ikke erhvervskøb. Det skal stå
                positivt frem for at blive udeladt — Clearhaus skal kunne se at vi ved
                det, og kunden skal ikke tro hun har en ret hun ikke har. */}
            <p className="cfv-b2b">
              Birdly sælges udelukkende til erhvervsdrivende. Da der er tale om et
              erhvervskøb, gælder der ingen forbrugerfortrydelsesret. En
              abonnementsperiode, der allerede er påbegyndt og betalt, refunderes ikke.
            </p>
            <div className="cfv-links">
              <Link href="/abonnementsbetingelser" className="cfv-link">
                Opsigelses- og refusionsvilkår
              </Link>
              <Link href="/handelsbetingelser" className="cfv-link">
                Handels- og leveringsbetingelser
              </Link>
            </div>
          </div>

          {/* Betalingsmetoder — samme markup som funnelen. */}
          <div className="bredde-q" style={{ marginTop: 4 }}>Betaling</div>
          <div className="pay-methods" aria-hidden="true">
            <span className="pm-tab">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.94c1.5 0 2.75-1.06 4-1.06 1.25 0 2.5 1.06 4 1.06" /><path d="M16 6c-1.5 0-3 1-4 3-1-2-2.5-3-4-3-2 0-3.5 2-3.5 5 0 4 3.5 8 5.5 8" /></svg>
              Apple Pay
            </span>
            <span className="pm-tab">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Kort
            </span>
            <span className="pm-tab">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="3" width="10" height="18" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
              MobilePay
            </span>
          </div>
          <p className="sub" style={{ margin: "0 0 16px 36px" }}>Du vælger metode og indtaster kort i betalingsvinduet.</p>

          {/* Samme linje som funnelen viser over kortfelterne. */}
          <div className="betaling-note">
            <b>Til betaling i dag: 0,00 kr.</b>
            {" "}· {TRIAL_DAYS} dages gratis prøveperiode · første træk om {TRIAL_DAYS} dage
          </div>

          {/* ── FRISBII-OMRÅDET ──
              ⚠️ PLADSHOLDER, IKKE ATTRAP. Her ligger Frisbii's iframe i den rigtige
              funnel. Vi ejer alt uden om den; kortnummeret ser vi aldrig. */}
          <div className="cfv-frisbii">
            <div className="cfv-frisbii-ic">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
            <div className="cfv-frisbii-t">Her indlæses Frisbii&apos;s PCI-sikre kortformular</div>
            <div className="cfv-frisbii-s">
              I den rigtige tilmelding indsætter Frisbii sit betalingsvindue på denne plads.
              Kortoplysninger indtastes direkte hos Frisbii — Birdly ser eller gemmer aldrig
              kortnummeret. Feltet er bevidst tomt i denne forhåndsvisning, så siden ikke kan
              gennemføre en betaling.
            </div>
          </div>

          {/* ── CLEARHAUS 4: GRUNDVILKÅR + KORTINDEHAVERS ACCEPT ──
              ⚠️ I den rigtige funnel ligger disse to flueben på TRIN 3, ikke ved
              betalingen. Clearhaus vil se accepten dér hvor kortet indtastes. Samme
              .consent-klasser som funnelen bruger — spejling, ikke ny stil. */}
          <div className="consent-block" style={{ marginTop: 18 }}>
            <label className="consent">
              <input type="checkbox" defaultChecked readOnly />
              <span>Jeg accepterer Birdlys betingelser, og at SMS og mail er en del af tjenesten.</span>
            </label>
            <div className="consent-links">
              <Link href="/handelsbetingelser">Handels- og leveringsbetingelser</Link>
              <Link href="/privatlivspolitik">Privatlivspolitik</Link>
            </div>
            <label className="consent">
              <input type="checkbox" defaultChecked readOnly />
              <span>
                Jeg accepterer abonnementsbetingelserne — herunder at abonnementet fornyes
                automatisk til {pris} ex. moms {hverFrekvens}, at der ikke trækkes betaling
                i prøveperioden, og at mit betalingskort gemmes hos vores betalingsudbyder,
                indtil jeg siger op.
              </span>
            </label>
            <div className="consent-links">
              <Link href="/abonnementsbetingelser">Abonnementsbetingelser</Link>
            </div>
          </div>

          {/* CTA — ser ud som funnelens, men er deaktiveret. Ingen handler. */}
          <button type="button" className="submit" disabled style={{ marginTop: 18 }}>
            Start gratis prøveperiode →
          </button>
          <p className="sub" style={{ textAlign: "center", marginTop: 8 }}>
            Knappen er slået fra i denne forhåndsvisning.
          </p>

          <div className="pay-secure" style={{ justifyContent: "center", marginTop: 14 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            Sikker betaling via Frisbii · Ingen binding · Opsig når som helst
          </div>
          <div className="note" style={{ marginTop: 10 }}>
            Kortoplysninger indtastes direkte hos vores PCI-sikre betalingspartner (Frisbii).
            Birdly ser eller gemmer aldrig dit kortnummer.
          </div>
        </div>

        {/* Oversigt til gennemsyn — så modtageren kan krydse af uden at lede. */}
        <div className="cfv-tjek">
          <div className="cfv-tjek-h">De syv oplysninger på denne side</div>
          <ol>
            <li><b>Virksomhedsnavn</b> — Birdly.dk, CVR 35764283, øverst i kortet</li>
            <li><b>Beskrivelse af ydelsen</b> — &ldquo;Hvad abonnementet giver adgang til&rdquo;</li>
            <li><b>Startdato + varighed</b> — &ldquo;Sådan fungerer betalingen&rdquo;</li>
            <li><b>Grundvilkår + kortindehavers accept</b> — de to afkrydsningsbokse med links</li>
            <li><b>Pris + valuta</b> — plan-kortene ({priceText.monthly} / {priceText.yearly}, ex. moms)</li>
            <li><b>Fast tilbagevendende frekvens</b> — &ldquo;fornyes løbende {hverFrekvens}, indtil du opsiger&rdquo;</li>
            <li><b>Opsigelse, refusion og fortrydelsesret</b> — samme afsnit, med links til begge betingelses-dokumenter</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
