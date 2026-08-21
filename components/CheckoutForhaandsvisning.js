"use client";

import { useState } from "react";
import { PLAN, TRIAL_DAYS, YEARLY_SAVING, priceText } from "../lib/pakke";
import "../app/checkout-forhaandsvisning.css";

// ============================================================================
// /checkout-forhaandsvisning — den planlagte betalingsside, vist til godkendelse.
//
// ⚠️ DEN KAN IKKE TRÆKKE PENGE, og det er ikke en indstilling man kan slå fra.
// Filen indlæser IKKE checkout.reepay.com/checkout.js, kalder IKKE
// create-subscription-session, og har INGEN submit-handler. Der findes ingen kodesti
// herfra til Frisbii. Tilføj aldrig en.
//
// ⚠️ KORTFELTERNE ER EN STATISK GENGIVELSE af det modul Frisbii kommer til at
// rendere. Det er ikke en attrap af noget der ikke findes: det ER den planlagte side,
// forelagt til godkendelse før den kan gå live — standard i en indløser-onboarding.
// Captionen "Sikre betalingsfelter leveres af Frisbii" står i modulet, så det aldrig
// kan læses som om Birdly selv tager imod kortnumre.
//
// ⚠️ 1:1 MED "Birdly – Betaling.html" (21-08-2026). Den mockup har sit EGET design —
// 460px kolonne, egen typografi, eget farvesæt — og bruger IKKE funnelens tilmeld.css.
// Derfor er CSS'en porteret frem for genbrugt. Ændrer Jonas mockuppen, skal begge
// filer følge med.
//
// ⚠️ TALLENE KOMMER FRA lib/pakke.js. Mockuppen har dem hardkodet; det må denne side
// ikke. Et tal skrevet af her ville blive stående efter en prisændring, og så ville
// Clearhaus have godkendt en pris vi ikke opkræver.
//
// ⚠️ SAMTYKKET STÅR ÉT STED — ved prisen, lige over knappen. Ikke gentaget. Det er
// bevidst en anden struktur end den live funnel, hvor krydset også står på trin 4
// fordi kontoen oprettes dér. Her er der ingen konto at oprette.
// ============================================================================

const PLANER = {
  year: {
    kort: priceText.yearly,
    fuld: `${priceText.yearly} ekskl. moms`,
    freq: "hvert år",
    // ⚠️ Beløbet, ikke procenten. Mockuppen siger "spar 998 kr." — et kronebeløb er
    // konkret dér hvor "~17 %" kræver hovedregning.
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
  // ⚠️ ÅR ER DEFAULT. Samme forvalg som den live funnel (Start.js: interval =
  // "yearly"), så replikaen viser dét kunden faktisk møder først.
  const [plan, setPlan] = useState("year");
  const v = PLANER[plan];

  return (
    <div className="cfv-side">
      <div className="cfv-wrap">
        {/* Banneret er ikke pynt: enhver der åbner linket — også internt — skal på
            første skærm forstå at der ikke kan gennemføres en betaling her. */}
        <div className="cfv-banner">
          <b>Forhåndsvisning.</b> Dette er Birdlys planlagte betalingsside, vist til
          godkendelse. Den kan ikke gennemføre en betaling eller oprette et abonnement,
          og den er ikke en del af tilmeldingsflowet.
        </div>

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

          {/* ── CLEARHAUS 5: PRIS + VALUTA ── */}
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

          {/* ── CLEARHAUS 1 + 2: SÆLGER OG YDELSE ──
              Samlet i én linje, som mockuppen. Kompakt, men begge oplysninger er der:
              hvem sælger, og hvad man køber. */}
          <p className="cfv-merchant">
            Birdly.dk · Offentlige og private opgaver i dit fag, leveret direkte på SMS og
            e-mail. Abonnement hos Birdly.dk, CVR 35764283, Fjordvej 4, 4300 Holbæk.
          </p>

          {/* ── CLEARHAUS 3, 6 og 7: STARTDATO, FREKVENS, OPSIGELSE ──
              ⚠️ Pris OG frekvens følger den valgte plan. Skifter kunden til månedlig,
              skifter både beløbet og "hver måned" med — ellers ville teksten love
              noget andet end knappen ovenfor. */}
          <div className="cfv-terms">
            <h3>Sådan fungerer det</h3>
            <ul>
              <li><span className="cfv-tick">✓</span><span>Abonnementet <b>starter i dag</b> med {TRIAL_DAYS} dages gratis prøveperiode.</span></li>
              <li><span className="cfv-tick">✓</span><span>Du betaler <b>0 kr. i dag</b>. 3 dage før prøveperioden udløber, sender vi en påmindelse.</span></li>
              <li><span className="cfv-tick">✓</span><span>Derefter <b>{v.fuld}</b>, der fornyes automatisk <b>{v.freq}</b>, indtil du opsiger.</span></li>
              <li><span className="cfv-tick">✓</span><span>Opsig når som helst med virkning fra næste betalingsperiode. <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">Opsigelses- og refusionsvilkår</a></span></li>
              {/* ⚠️ FORTRYDELSESRETTEN STÅR I HANDELSBETINGELSERNE §1.3, refusionen i
                  abonnementsbetingelserne §4.4 — derfor links til begge.
                  "Ingen fortrydelsesret" står positivt frem for at blive udeladt: det er
                  ikke en mangel, men et faktum om aftaletypen (B2B). Kunden skal ikke
                  tro hun har en ret hun ikke har. */}
              <li><span className="cfv-tick">✓</span><span>Erhvervskøb — ingen forbrugerfortrydelsesret. Påbegyndt periode refunderes ikke. <a href="/handelsbetingelser" target="_blank" rel="noreferrer">Handelsbetingelser</a></span></li>
            </ul>
          </div>

          {/* ── BETALINGSMODULET ──
              Statisk gengivelse. Se noten øverst: ingen SDK, ingen session, ingen
              handler. Feltværdierne er pladsholder-tekst, ikke inputs. */}
          <div className="cfv-pay">
            <div className="cfv-pay-cap">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 10V8a6 6 0 0112 0v2" stroke="#94A3B8" strokeWidth="2" />
                <rect x="4" y="10" width="16" height="10" rx="2" fill="#CBD5E1" />
              </svg>
              Sikre betalingsfelter leveres af Frisbii
            </div>

            <div className="cfv-wallet">
              {/* ⚠️ APPLE-LOGOET SOM SVG, ikke glyffen . Mockuppen bruger tegnet
                  , som kun findes i Apples egne skrifttyper: på Windows og Android
                  falder det ud, og knappen står bare med "Pay". Clearhaus skal kunne
                  SE at Apple Pay tilbydes — og de kigger på ukendt hardware.
                  Formen er den samme; kun kilden er robust. */}
              <span className="cfv-wbtn apple">
                <svg className="cfv-apple-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6-.1 0-2.6-1-2.6-3.8zM14.2 5.9c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
                </svg>
                Apple Pay
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

            {/* ── CLEARHAUS 4: KORTINDEHAVERENS ACCEPT ── */}
            <div className="cfv-consent">
              <span className="cfv-cbox">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l5 5 9-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                Jeg accepterer Birdlys{" "}
                <a href="/handelsbetingelser" target="_blank" rel="noreferrer">handelsbetingelser</a> og{" "}
                <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">abonnementsvilkår</a> — herunder
                at abonnementet fornyes automatisk {v.freq}, og at mit kort gemmes hos
                betalingsudbyderen, indtil jeg opsiger.
              </span>
            </div>

            {/* ⚠️ IKKE EN <button>. Et klikbart element ville invitere til et forsøg og
                efterlade indtryk af at siden kan noget. Den er markup, ikke kontrol. */}
            <div className="cfv-cta" aria-disabled="true">Start {TRIAL_DAYS} dage gratis →</div>
            <p className="cfv-undercta">
              <strong>Du betaler 0 kr. i dag.</strong> Efter {TRIAL_DAYS} dage fortsætter Birdly
              automatisk til {v.kort} ekskl. moms, indtil du opsiger.
            </p>
          </div>

          <div className="cfv-trust">
            <div className="cfv-locks">🔒 Sikker betaling · SSL-krypteret</div>
            <div className="cfv-badges">
              <span className="cfv-bdg dk">Dankort</span>
              <span className="cfv-bdg visa">VISA</span>
              <span className="cfv-bdg mc">Mastercard</span>
              <span className="cfv-bdg mp">MobilePay</span>
              <span className="cfv-bdg ap"> Pay</span>
            </div>
          </div>
        </div>

        {/* Oversigt til modtageren — så de syv punkter kan krydses af uden at lede. */}
        <div className="cfv-tjek">
          <div className="cfv-tjek-h">De syv oplysninger på denne side</div>
          <ol>
            <li><b>Virksomhedsnavn</b> — Birdly.dk, CVR 35764283, i linjen under prisen</li>
            <li><b>Beskrivelse af ydelsen</b> — samme linje</li>
            <li><b>Startdato + varighed</b> — &ldquo;Sådan fungerer det&rdquo;, punkt 1</li>
            <li><b>Grundvilkår + kortindehavers accept</b> — afkrydsningsboksen over knappen</li>
            <li><b>Pris + valuta</b> — plan-knapperne ({PLAN.monthly.toLocaleString("da-DK")} kr./md. / {PLAN.yearly.toLocaleString("da-DK")} kr./år, ekskl. moms)</li>
            <li><b>Fast tilbagevendende frekvens</b> — &ldquo;fornyes automatisk {v.freq}, indtil du opsiger&rdquo;</li>
            <li><b>Opsigelse, refusion og fortrydelsesret</b> — punkt 4 og 5, med links til begge betingelses-dokumenter</li>
          </ol>
          <p className="cfv-tjek-note">
            Betalingsfelterne ovenfor er en statisk gengivelse af det modul Frisbii leverer.
            Siden kan ikke gennemføre en betaling.
          </p>
        </div>
      </div>
    </div>
  );
}
