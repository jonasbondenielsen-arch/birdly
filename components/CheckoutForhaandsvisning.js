"use client";

import { useState } from "react";
import { TRIAL_DAYS, YEARLY_SAVING, priceText } from "../lib/pakke";
import "../app/checkout-forhaandsvisning.css";

// ============================================================================
// /checkout-forhaandsvisning — REN 1:1-kopi af "Birdly – Betaling.html".
//
// ⚠️ INGEN FORKLARINGS- ELLER META-TEKST PÅ SIDEN (22-08-2026).
// Tidligere udgaver havde et forhåndsvisnings-banner, en caption ("Sikre
// betalingsfelter leveres af Frisbii") og en nummereret oversigt over de syv
// Clearhaus-punkter. Alt er fjernet, og det er ikke kosmetik: Clearhaus skal se
// PRÆCIS dét kunden møder. Står der noget på replikaen som ikke står på den rigtige
// checkout, godkender de en side der ikke findes.
//
// Tilføj aldrig en note, et badge eller en hjælpetekst her uden at den samme tekst
// også står i den rigtige funnel.
//
// ⚠️ SIKKERHEDEN ER UÆNDRET — kun den synlige tekst er væk.
// Filen indlæser IKKE checkout.reepay.com/checkout.js, kalder IKKE
// create-subscription-session, har INGEN <form> og INGEN submit-handler. CTA'en og
// wallet-knapperne er <div>/<span>, ikke <button>: et klikbart element ville invitere
// til et forsøg og efterlade indtryk af at siden kan noget. Der findes ingen kodesti
// herfra til Frisbii. Tilføj aldrig en.
//
// ⚠️ TALLENE KOMMER FRA lib/pakke.js. Mockuppen har dem hardkodet; det må siden ikke.
// Et tal skrevet af her ville blive stående efter en prisændring, og så ville
// Clearhaus have godkendt en pris vi ikke opkræver.
//
// ⚠️ LAYOUT-RÆKKEFØLGEN ER JONAS' (22-08): kortboksen FØR "Sådan fungerer betalingen".
// Den essentielle linje — 0 kr. i dag, fornyes automatisk, opsig når som helst — og
// samtykket står ved selve knappen, hvor beslutningen træffes. Detaljerne står under.
// Ingen adresse (den hører i handelsbetingelserne), ingen matchgaranti (markedsføring,
// ikke et betalingskrav).
// ============================================================================

const PLANER = {
  year: {
    kort: priceText.yearly,
    fuld: `${priceText.yearly} ekskl. moms`,
    freq: "hvert år",
    // Beløbet, ikke procenten: et kronebeløb er konkret dér hvor "~17 %" kræver
    // hovedregning.
    sub: `${priceText.yearly} · spar ${YEARLY_SAVING.amount.toLocaleString("da-DK")} kr.`,
  },
  month: {
    kort: priceText.monthly,
    fuld: `${priceText.monthly} ekskl. moms`,
    freq: "hver måned",
    sub: priceText.monthly,
  },
};

export default function CheckoutForhaandsvisning() {
  // ÅR ER DEFAULT — samme forvalg som den live funnel (Start.js: interval="yearly").
  const [plan, setPlan] = useState("year");
  const v = PLANER[plan];

  return (
    <div className="cfv-side">
      <div className="cfv-wrap">
        <div className="cfv-brand-row">
          <div className="cfv-brand-mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 14c4-1 7-4 9-8 1 3 3 5 6 6-3 2-5 4-6 8-1-3-4-5-9-6z" fill="#fff" />
            </svg>
          </div>
          <div className="cfv-brand">Birdly</div>
        </div>

        <div className="cfv-card">
          <p className="cfv-eyebrow">Kom i gang</p>
          <h1>Start din prøveperiode</h1>

          <div className="cfv-plan" role="group" aria-label="Vælg abonnement">
            <button type="button" className={"cfv-plan-opt" + (plan === "year" ? " active" : "")}
              onClick={() => setPlan("year")} aria-pressed={plan === "year"}>
              <span className="cfv-po-tag">MEST VALGT</span>
              <span className="cfv-po-title">Årligt</span>
              <span className="cfv-po-sub">{PLANER.year.sub}</span>
            </button>
            <button type="button" className={"cfv-plan-opt" + (plan === "month" ? " active" : "")}
              onClick={() => setPlan("month")} aria-pressed={plan === "month"}>
              <span className="cfv-po-title">Månedligt</span>
              <span className="cfv-po-sub">{PLANER.month.sub}</span>
            </button>
          </div>

          <p className="cfv-sub">
            <strong>{TRIAL_DAYS} dage gratis</strong> · derefter {v.kort} ekskl. moms
          </p>

          {/* Sælger + ydelse i én linje. Ingen adresse — se noten øverst. */}
          <p className="cfv-merchant">
            Birdly.dk · CVR 35764283 — offentlige og private opgaver i dit fag, på SMS og e-mail.
          </p>

          {/* ---------- KORTBETALINGS-BOKSEN ---------- */}
          <div className="cfv-pay">
            <div className="cfv-wallet">
              {/* ⚠️ APPLE-LOGOET SOM SVG, ikke glyffen . Tegnet findes kun i Apples
                  egne skrifttyper; på Windows og Android falder det ud, og knappen
                  står bare med "Pay". Clearhaus kigger på ukendt hardware og skal
                  kunne SE at Apple Pay tilbydes. Formen er den samme. */}
              <span className="cfv-wbtn apple">
                <svg className="cfv-apple-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6-.1 0-2.6-1-2.6-3.8zM14.2 5.9c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
                </svg>
                Pay
              </span>
              <span className="cfv-wbtn mp"><span className="cfv-mpmark">M</span> MobilePay</span>
            </div>

            <div className="cfv-or">eller betal med kort</div>

            <div className="cfv-field">
              <label>Kortnummer</label>
              <div className="cfv-inp">
                <span>1234&nbsp;1234&nbsp;1234&nbsp;1234</span>
                <span className="cfv-brandmini">
                  <span className="cfv-bdg dk">Dankort</span>
                  <span className="cfv-bdg visa">VISA</span>
                  <span className="cfv-bdg mc">MC</span>
                </span>
              </div>
            </div>
            <div className="cfv-row2">
              <div className="cfv-field"><label>Udløb</label><div className="cfv-inp"><span>MM / ÅÅ</span></div></div>
              <div className="cfv-field"><label>CVC</label><div className="cfv-inp"><span>123</span></div></div>
            </div>

            <div className="cfv-consent">
              <span className="cfv-cbox">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l5 5 9-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                Jeg accepterer Birdlys{" "}
                <a href="/handelsbetingelser" target="_blank" rel="noreferrer">handels-</a> og{" "}
                <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">abonnementsbetingelser</a> — herunder
                at abonnementet fornyes automatisk, og at mit kort gemmes hos
                betalingsudbyderen, indtil jeg opsiger.
              </span>
            </div>

            <div className="cfv-cta" aria-disabled="true">Start {TRIAL_DAYS} dage gratis →</div>
            <p className="cfv-undercta">
              <strong>0 kr. i dag.</strong> Efter {TRIAL_DAYS} dage fornyes automatisk til{" "}
              {v.kort} ekskl. moms · opsig når som helst.
            </p>
          </div>

          {/* ---------- DETALJER, UNDER KORTBOKSEN ---------- */}
          <div className="cfv-terms">
            <h3>Sådan fungerer betalingen</h3>
            <ul>
              <li><span className="cfv-tick">✓</span><span>Starter i dag med {TRIAL_DAYS} dages gratis prøveperiode. Du betaler 0 kr. i dag, og vi minder dig 3 dage før prøven udløber.</span></li>
              <li><span className="cfv-tick">✓</span><span>Derefter <b>{v.fuld}</b>, fornyes automatisk <b>{v.freq}</b>, indtil du opsiger.</span></li>
              <li><span className="cfv-tick">✓</span><span>Opsig når som helst med virkning fra næste betalingsperiode. <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">Opsigelses- og refusionsvilkår</a></span></li>
              {/* Fortrydelsesretten står i handelsbetingelserne §1.3, refusionen i
                  abonnementsbetingelserne §4.4 — derfor links til begge. */}
              <li><span className="cfv-tick">✓</span><span>Erhvervskøb: ingen forbrugerfortrydelsesret, og påbegyndt periode refunderes ikke. <a href="/handelsbetingelser" target="_blank" rel="noreferrer">Handelsbetingelser</a></span></li>
            </ul>
          </div>

          <div className="cfv-trust">
            <div className="cfv-locks">🔒 Sikker betaling · SSL-krypteret</div>
            <div className="cfv-badges">
              <span className="cfv-bdg dk">Dankort</span>
              <span className="cfv-bdg visa">VISA</span>
              <span className="cfv-bdg mc">Mastercard</span>
              <span className="cfv-bdg mp">MobilePay</span>
              <span className="cfv-bdg ap">Apple Pay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
