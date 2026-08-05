"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { createSubscriptionSession } from "../lib/catalog";
import { priceText, planForInterval } from "../lib/pakke";
import "../app/start.css";

// ============================================================================
// /b/{kode} — KORTLØS BETALINGSLINK (05-08-2026, midlertidig).
//
// Kunden er onboardet uden kort mens indløseraftalen godkendes. Linket kommer i
// 2-dages-varslet og i farvel-mailen, og fører hende direkte til Reepays hostede
// checkout — uden at hun skal gennem funnelen igen.
//
// ⚠️ VI SENDER KUN KODEN. Mail, navn og telefon slås op server-side i
// create-subscription-session med service-rollen. Sendte vi dem herfra, kunne
// enhver med koden læse kundens kontaktoplysninger ud af et netværkskald.
//
// ⚠️ INGEN NY PRØVE. Serveren sætter no_trial ud fra rækkens egen kortloes-
// markering. Klienten kan ikke påvirke det.
//
// ⚠️ GRÆSFRIST. Linket virker 7 dage EFTER adgangen lukkede — hele pointen er at
// en kunde der læser farvel-mailen næste morgen kan fortryde med ét klik.
// Serveren håndhæver fristen; her viser vi bare svaret.
//
// Samme SDK-indlæsning og samme WindowSubscription som /start: Reepay ejer hele
// siden, og vi ejer ingen container der kan klemme layoutet.
// ============================================================================

function loadReepay() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Reepay) return resolve(window.Reepay);
    const existing = document.getElementById("reepay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Reepay));
      existing.addEventListener("error", () => reject(new Error("Betalingsvinduet kunne ikke indlæses.")));
      return;
    }
    const s = document.createElement("script");
    s.id = "reepay-checkout-js";
    s.src = "https://checkout.reepay.com/checkout.js";
    s.async = true;
    s.onload = () => resolve(window.Reepay);
    s.onerror = () => reject(new Error("Betalingsvinduet kunne ikke indlæses."));
    document.head.appendChild(s);
  });
}

export default function KortloesBetal({ code }) {
  const [interval, setInterval_] = useState("monthly");
  const [sessionId, setSessionId] = useState(null);
  const [fejl, setFejl] = useState("");
  const [henter, setHenter] = useState(true);

  // Sessionen hentes med det samme, så knappen er klar når kunden har læst siden.
  // Fejler den, viser vi serverens egen besked — den skelner mellem "ikke gyldigt",
  // "betaler allerede" og "udløbet", og de tre kræver hver sin handling af kunden.
  useEffect(() => {
    let afbrudt = false;
    setHenter(true);
    setFejl("");
    setSessionId(null);
    createSubscriptionSession({
      kortloes_code: code,
      billing: interval,
      retur: "kortloes",
      package: planForInterval(interval),
    })
      .then((r) => { if (!afbrudt) setSessionId(r.session_id); })
      .catch((e) => { if (!afbrudt) setFejl(e.message || "Linket kunne ikke åbnes."); })
      .finally(() => { if (!afbrudt) setHenter(false); });
    return () => { afbrudt = true; };
  }, [code, interval]);

  function aabnBetaling() {
    if (!sessionId) return;
    setFejl("");
    loadReepay()
      .then((Reepay) => { new Reepay.WindowSubscription(sessionId); })
      .catch((e) => setFejl(e.message));
  }

  const pris = priceText[interval];

  return (
    <main className="st-wrap">
      <div className="st-top"><Logo height={30} /></div>

      {fejl && <div className="st-fejl">{fejl}</div>}

      <div className="st-kort">
        <h1>Fortsæt med Birdly</h1>
        <p className="st-hj">
          Tilføj betaling, så finder vi bare videre — du beholder din opgaveliste og får
          fortsat besked på SMS og mail, når der er en opgave, der passer til jer.
        </p>

        <div className="st-plan">
          {[
            ["yearly", "År", priceText.yearly, priceText.saveShort],
            ["monthly", "Måned", priceText.monthly, "ingen binding"],
          ].map(([k, l, beloeb, note]) => (
            <button
              key={k}
              type="button"
              className={"st-planknap" + (interval === k ? " on" : "")}
              onClick={() => setInterval_(k)}
              aria-pressed={interval === k}
            >
              <b>{l}</b>
              <span>{beloeb}</span>
              <i>{henter && interval === k ? "henter…" : note}</i>
            </button>
          ))}
        </div>

        {/* ⚠️ INGEN "0,00 kr. i dag" HER. Prøven er brugt — der trækkes med det samme.
            Stod der gratis, ville kunden føle sig snydt ved første kontoudtog. */}
        <p className="st-derefter">
          <b>{pris}.</b>
          <span>Ekskl. moms · {interval === "yearly" ? priceText.saveShort : "ingen binding"} · du kan sige op når som helst</span>
        </p>

        <button className="btn btn-teal st-bred" onClick={aabnBetaling} disabled={!sessionId}>
          {henter ? "Et øjeblik…" : "Tilføj betaling og fortsæt →"}
        </button>
        <p className="st-mini">Betalingen håndteres af Frisbii. Dine kortoplysninger rører aldrig Birdly.</p>
      </div>
    </main>
  );
}
