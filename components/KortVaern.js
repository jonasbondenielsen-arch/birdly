"use client";

import { Component } from "react";
import { rapporterFejl } from "../lib/fejlrapport";

// ============================================================================
// KORT-VÆRN — én error boundary pr. kort, så et brud har en radius på ét kort.
//
// ⚠️ HVORFOR DEN FINDES. 31-08-2026 kaldte PrivatOpgaveKort en funktion der ikke
// var importeret. Resultatet var ikke et brudt kort — det var HTTP 500 på hele
// samlesiden, inklusive de offentlige udbud der intet fejlede. 12 kunder havde
// en helt død side i 5 dage. Et kort der fejler, må koste ét kort.
//
// ⚠️ DEN SKJULER IKKE FEJLEN, DEN BEGRÆNSER DEN. onFejl kaldes altid, så fejlen
// stadig når alarmeringen. Et værn der gør fejl usynlige, er værre end ingen —
// så ville vi have en side der ser hel ud, mens kortene forsvinder ét for ét.
//
// ⚠️ FALLBACKEN LOVER IKKE NOGET. Den siger at noget ikke kunne vises, ikke at
// opgaven er væk eller lukket. Kunden må aldrig kunne læse en teknisk fejl som
// en besked om sin sag.
//
// ⚠️ KLASSEKOMPONENT MED VILJE. React har stadig ingen hook-baseret
// error boundary; componentDidCatch findes kun på en klasse.
// ============================================================================

export default class KortVaern extends Component {
  constructor(props) {
    super(props);
    this.state = { fejlet: false };
  }

  static getDerivedStateFromError() {
    return { fejlet: true };
  }

  componentDidCatch(fejl, info) {
    // ⚠️ VIDERE TIL ALARMERINGEN, ikke kun til konsollen. Sentry samler
    // automatisk op på det her, når DSN'en er sat; uden den er console.error
    // stadig det bedste vi har.
    try {
      // ⚠️ VIDERE TIL ALARMERINGEN. Et vaern der bare skjuler fejlen, er
      // vaerre end ingen: saa ser siden hel ud, mens kortene forsvinder ét
      // for ét, og ingen opdager det.
      rapporterFejl(fejl, { rute: this.props.navn || "kort", kilde: "klient" });
      this.props.onFejl?.(fejl, info);
    } catch { /* et vaern der selv kaster, hjaelper ingen */ }
    console.error(`[kort-vaern] ${this.props.navn || "ukendt kort"} fejlede:`, fejl?.message || fejl);
  }

  render() {
    if (!this.state.fejlet) return this.props.children;

    return (
      <article style={{
        border: "1px solid #E4E9F0", borderRadius: 14, padding: "14px 16px",
        background: "#FAFBFD", color: "#5A6678", fontSize: 13.5, lineHeight: 1.55,
      }}>
        Vi kunne ikke vise dette punkt lige nu. Resten af siden virker, og vi er
        blevet gjort opmærksom på det. Prøv at genindlæse om lidt.
      </article>
    );
  }
}
