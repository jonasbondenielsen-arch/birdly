"use client";

import { Logo } from "../Logo";
import { KundecitatKompakt } from "../Kundecitater";
import "../../app/start.css";
import "../../app/kundecitater.css";

// ============================================================================
// GROWTH #2 — PREVIEW AF /start SKÆRM 1. IKKE PRODUKTION.
//
// ⚠️ DEN SPORER INTET, OG DET ER MED VILJE. Hverken `sporFunnel`, `sporEvent`,
// `milepael` eller pixlen er importeret. Et preview må ikke kunne lægge en
// eneste hændelse i produktionens tragt — v4's tal skal kunne læses som om
// denne side ikke fandtes.
//
// ⚠️ DEN ER EN STATISK GENGIVELSE, IKKE EN GAFFEL AF Start.js. Feltet slår
// ingen CVR op, knappen gør ingenting. Formålet er at kunne SE layoutet på
// desktop og mobil — ikke at køre funnelen. En rigtig gaffel af Start.js ville
// skulle holdes synkroniseret med produktionen og ville før eller siden
// komme til at sende events.
//
// ⚠️ INTET NYT DESIGN. Hver klasse herunder findes allerede:
//   st-wrap · st-top · st-trin* · st-kort · st-pre-h2 · st-hj · st-lab
//   st-felt · btn btn-teal st-bred
// Den eneste nye CSS i hele Growth #2 er `kc-*` til citat-kassen, og den er
// bygget af eksisterende tokens (--sky-soft, --sky-200, --r, --teal).
// ============================================================================

export default function Growth2Start({ visMatchLinje = true }) {
  return (
    /* ⚠️ `st-wrap` UDEN `st-wrap-bred`. De 520 px er husets egen bredde for
       trin 1-4 — altså præcis den kolonne resten af funnelen allerede bruger.
       v4 bruger `st-wrap-bred` (1120 px) FORDI den har to kolonner; uden
       argumentkolonnen er den brede ramme der ikke længere noget at fylde ud.
       Ingen ny max-width opfundet. */
    <div className="st-wrap">
      {/* Husets eget funnel-hoved — uændret. */}
      <div className="st-top">
        <Logo height={30} />
        <a className="st-tilbage-link" href="/kom-i-gang">Tilbage til Birdly.dk</a>
      </div>

      {/* ⚠️ TRINVISEREN BLIVER STÅENDE. Den er ikke forklaring; den er
          orientering, og at fjerne den ville gøre funnelen mere uklar, ikke
          mindre. Hypotesen er "mindre forklaring før første handling" — ikke
          "færre holdepunkter". */}
      <ol className="st-etaper" aria-label="Etape 1 af 4: Virksomhed">
        {["Virksomhed", "Opgaver", "Dine match", "Start Birdly"].map((e, i) => (
          <li key={e} className={i === 0 ? "nu" : ""}>
            <span className="st-etape-prik" aria-hidden="true">{i + 1}</span>
            <span className="st-etape-navn">{e}</span>
          </li>
        ))}
      </ol>

      {/* ⚠️ ÉN KOLONNE, IKKE TO. Det er hele forskellen fra v4: argumentet,
          indvendingen, prisankeret og statistikgriddet er IKKE på første
          viewport. Komponenterne er ikke slettet fra kodebasen — de vises
          bare ikke her, så hypotesen kan isoleres. */}
      <>
        <div className="st-kort" data-clarity-mask="True">
          <h2 className="st-pre-h2">Se hvilke opgaver der passer til jeres virksomhed</h2>
          <p className="st-hj">Indtast jeres CVR. Birdly finder relevante opgaver til jer.</p>

          <label className="st-lab" htmlFor="pv-cvr">CVR-nummer</label>
          <input
            id="pv-cvr" className="st-felt" inputMode="numeric" autoComplete="off"
            maxLength={11} placeholder="12345678" defaultValue=""
          />

          {/* Den linje v4 indførte. Previewet kan vise siden med og uden, så
              det kan vurderes om den hjælper eller bare fylder. */}
          {visMatchLinje && <p className="st-hj">Se jeres matches først. Opret jer bagefter.</p>}

          <button className="btn btn-teal st-bred" type="button">Vis mine matches →</button>
        </div>

        {/* Social proof umiddelbart efter handlingen — på både desktop og
            mobil, fordi kortet her er én kolonne begge steder. */}
        <KundecitatKompakt />
      </>
    </div>
  );
}
