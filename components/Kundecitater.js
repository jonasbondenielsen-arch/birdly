"use client";

import { useEffect, useRef, useState } from "react";
import { KUNDECITATER, KUNDECITAT_KICK } from "../lib/kundecitater";

// ============================================================================
// KUNDEUDTALELSER — TO FLADER, ÉN KILDE (07-10-2026)
//
// ⚠️ INTET NYT DESIGNSPROG. Begge varianter er bygget af klasser der allerede
// findes: `sg-kort` (hvid, 1px --line, --r, --shadow) er forsidens kort,
// `sg-kick`/`sg-prik` er dens kicker med live-diode, `st-kort`-familien er
// funnelens. `figure`/`blockquote`/`figcaption`-markuppen er kopieret fra den
// Kundebevis-sektion der allerede lå klar i Sektioner.js — den ventede kun på
// rigtige citater.
//
// ⚠️ INGEN SPORING HERFRA. Komponenten importerer hverken ctaSporing eller
// analytics. Den skal kunne stå i et preview uden at forurene produktionens
// tragt.
// ============================================================================

/**
 * FORSIDEN — to kort side om side, højt placeret.
 *
 * ⚠️ `sg-tre` ER HUSETS GRID og håndterer selv mobilen. Vi sætter to kort i et
 * grid bygget til tre; det er med vilje — en egen to-kolonne-regel ville være
 * endnu et sted mobilopførslen kunne drive fra forsidens øvrige sektioner.
 */
export function KundecitatRaekke() {
  return (
    <section className="sg-sek-taet">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">
            <span className="sg-prik" aria-hidden="true" /> {KUNDECITAT_KICK}
          </span>
        </div>
        <div className="sg-tre" style={{ marginTop: 18 }}>
          {KUNDECITATER.map((k) => (
            <figure className="sg-kort" key={k.navn} style={{ margin: 0 }}>
              <blockquote style={{ margin: 0, fontSize: "16.5px", lineHeight: 1.6, color: "var(--navy)" }}>
                &ldquo;{k.citat}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: 14, fontSize: 14.5, color: "var(--navy-soft)" }}>
                <b style={{ color: "var(--navy)" }}>{k.navn}</b><br />{k.firma}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * FUNNELEN — ét kompakt citat under CTA'en, der skifter langsomt.
 *
 * ⚠️ BEGGE CITATER LIGGER I DOM'EN HELE TIDEN. Det inaktive er skjult med
 * `visibility`, ikke fjernet: en skærmlæser og en søgemaskine skal kunne se
 * begge, og højden må ikke ændre sig når der skiftes. Derfor ligger de oven på
 * hinanden i et grid med én celle — kassen er altid så høj som det længste
 * citat, og der sker INTET layout shift.
 *
 * ⚠️ 7 SEKUNDER, IKKE 3. Et citat skal kunne læses færdigt af en der læser
 * langsomt. En hurtig karrusel er en animation, ikke et bevis.
 *
 * ⚠️ DEN STOPPER VED BERØRING. Hover, fokus og `prefers-reduced-motion`
 * standser skiftet — en tekst der flytter sig mens man læser den, er værre end
 * ingen rotation.
 */
export function KundecitatKompakt({ rotation = true }) {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const reduceret = useRef(false);

  useEffect(() => {
    try {
      reduceret.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch { /* uden matchMedia roterer vi bare */ }
  }, []);

  useEffect(() => {
    if (!rotation || pause || reduceret.current || KUNDECITATER.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % KUNDECITATER.length), 7000);
    return () => clearInterval(t);
  }, [rotation, pause]);

  return (
    <div
      className="kc-kompakt"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      onFocusCapture={() => setPause(true)}
      onBlurCapture={() => setPause(false)}
    >
      {/* ⚠️ FUNNELENS EGNE KLASSER, IKKE FORSIDENS. `sg-kick`/`sg-prik` bor i
          salg.css, som IKKE indlæses på /start — brugte vi dem her, ville
          kickeren stå som umarkeret brødtekst og dioden slet ikke findes.
          `st-pre-kick` og `st-prik` er den samme kicker i funnelens eget
          stilark og er allerede i brug over bevis-kortet. */}
      <span className="st-pre-kick kc-kick">
        <span className="st-prik" aria-hidden="true" /> {KUNDECITAT_KICK}
      </span>

      <div className="kc-stak">
        {KUNDECITATER.map((k, n) => (
          <figure className="kc-citat" key={k.navn} aria-hidden={n !== i} style={{ visibility: n === i ? "visible" : "hidden" }}>
            <blockquote>&ldquo;{k.citat}&rdquo;</blockquote>
            <figcaption><b>{k.navn}</b> · {k.firma}</figcaption>
          </figure>
        ))}
      </div>

      {/* ⚠️ INDIKATORERNE ER KNAPPER, IKKE PRIKKER. Kan man se at der er to,
          skal man også kunne vælge den anden. Samme diode-form som husets
          øvrige indikatorer, bare uden pulsen. */}
      {KUNDECITATER.length > 1 && (
        <div className="kc-dots">
          {KUNDECITATER.map((k, n) => (
            <button
              key={k.navn}
              type="button"
              className={"kc-dot" + (n === i ? " on" : "")}
              aria-label={`Vis udtalelse fra ${k.firma}`}
              aria-pressed={n === i}
              onClick={() => { setI(n); setPause(true); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
