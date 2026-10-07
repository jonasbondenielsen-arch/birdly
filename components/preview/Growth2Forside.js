"use client";

import { Logo } from "../Logo";
import { KundecitatRaekke } from "../Kundecitater";
import { TRIAL_DAYS } from "../../lib/pakke";
import "../../app/salg.css";
import "../../app/kundecitater.css";

// ============================================================================
// GROWTH #2 — PREVIEW AF FORSIDENS HERO + CITATER HØJT. IKKE PRODUKTION.
//
// ⚠️ SPORER INTET. Samme regel som Growth2Start: ingen ctaSporing, ingen
// pixel, ingen milepæle. Den levende forside er uberørt.
//
// ⚠️ KUN HEROEN OG CITATERNE. Resten af forsiden (bevis-bjælke, fag-vælger,
// flow, planer, FAQ, garanti) er IKKE gengivet her — previewet skal vise
// hvad en besøgende møder i de første to skærmfulde, ikke være en kopi af en
// 4.000 linjers side. Alt det øvrige står uændret i produktionen.
//
// ⚠️ GENBRUGTE KLASSER: sg-wrap · sg-sek-taet · sg-midt · sg-kick · sg-prik
// sg-big · sg-em · sg-lead · sg-btn · sg-btn-teal · sg-btn-stor · sg-fin
// sg-kort · sg-tre. Ingen nye.
// ============================================================================

export default function Growth2Forside() {
  return (
    <div className="sg">
      {/* Husets eget sidehoved i forenklet form — logo + én CTA. */}
      <div className="sg-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 22, paddingBottom: 6 }}>
        <Logo height={30} />
        <a className="sg-btn sg-btn-teal" href="/start">Find opgaver nu</a>
      </div>

      {/* ───────────────── HERO ─────────────────
          ⚠️ RESULTATET I OVERSKRIFTEN, KANALEN I SAMME SÆTNING. "direkte på
          SMS" er ikke en feature her; det er formen resultatet ankommer i, og
          det er den ene ting kunderne selv fremhæver — se Tessies citat
          nedenfor. Ingen teknologi, ingen proces, ingen AI. */}
      <section className="sg-sek-taet">
        <div className="sg-wrap">
          <div className="sg-midt">
            <h1 className="sg-big">
              Få relevante rengøringsopgaver <span className="sg-em">direkte på SMS</span>
            </h1>
            <p className="sg-lead">
              Birdly finder offentlige og private opgaver, der passer til jeres virksomhed.
            </p>
            <div style={{ marginTop: 22 }}>
              <a className="sg-btn sg-btn-teal sg-btn-stor" href="/start">
                Se hvilke opgaver der passer til os →
              </a>
            </div>
            {/* ⚠️ VILKÅRENE STÅR, OG DE ER SANDE OM DENNE KNAP: den fører til
                /start, hvor der hverken oprettes noget eller bindes et kort.
                Prøvelængden interpoleres fra lib/pakke.js — aldrig et ciffer
                skrevet i hånden. */}
            <p className="sg-fin">{TRIAL_DAYS} dage gratis · Ingen binding</p>
          </div>
        </div>
      </section>

      {/* ───────────── SOCIAL PROOF, HØJT ─────────────
          ⚠️ UMIDDELBART EFTER HEROENS CTA. Pointen med Growth #2 er at beviset
          skal nås før forklaringen — ikke ligge i en testimonial-sektion langt
          nede, hvor kun de allerede overbeviste kommer hen. */}
      <KundecitatRaekke />

      {/* ⚠️ HEREFTER FORTSÆTTER DEN NUVÆRENDE FORSIDE UÆNDRET. Previewet
          stopper her med vilje — resten af siden er ikke en del af hypotesen. */}
      <section className="sg-sek-taet">
        <div className="sg-wrap">
          <div className="sg-midt">
            <p className="sg-fin" style={{ opacity: .7 }}>
              — herefter fortsætter forsiden præcis som i dag (bevis-bjælke, fagvælger,
              sådan virker det, priser, FAQ). Ikke gengivet i previewet.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
