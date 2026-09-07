"use client";

import { useState } from "react";
import { FAQ_SALG_TOP, FAQ_SALG_REST } from "../../lib/faq";

// ============================================================================
// FAQ'en: seks synlige, resten et klik væk.
//
// ⚠️ RESTEN ER FOLDET, IKKE FJERNET — OG DEN STÅR I HTML'EN HELE TIDEN. Knappen
// styrer kun `hidden`, ikke om elementerne findes. Det er en bevidst forskel:
// svarene på "hvor kommer opgaverne fra", "hvordan virker bud-skabelonen" og
// "hvor mange sms'er får jeg" er husets eneste fulde forklaringer, og de skal
// blive ved med at kunne crawles og læses af en svartjeneste. Renderede vi dem
// først ved klik, ville de forsvinde fra sidens indhold.
//
// ⚠️ HVERT SVAR ER STADIG EN <details>. Den der leder efter ét bestemt svar skal
// ikke folde elleve ud for at finde det.
// ============================================================================
export default function FaqListe() {
  const [visAlle, setVisAlle] = useState(false);

  return (
    <div className="sg-faq">
      {FAQ_SALG_TOP.map((f) => (
        <details key={f.sp}>
          <summary>{f.sp}<span className="sg-pm" aria-hidden="true">+</span></summary>
          <div className="sg-faq-svar">{f.svar}</div>
        </details>
      ))}

      {FAQ_SALG_REST.length > 0 && (
        <>
          {/* `hidden` frem for at undlade at rendere: indholdet er i dokumentet
              uanset, og browseren skjuler det. Se noten øverst. */}
          <div hidden={!visAlle}>
            {FAQ_SALG_REST.map((f) => (
              <details key={f.sp}>
                <summary>{f.sp}<span className="sg-pm" aria-hidden="true">+</span></summary>
                <div className="sg-faq-svar">{f.svar}</div>
              </details>
            ))}
          </div>

          <button
            type="button"
            className="sg-faq-mere"
            aria-expanded={visAlle}
            onClick={() => setVisAlle((v) => !v)}
          >
            {visAlle ? "Skjul de øvrige spørgsmål" : `Se alle spørgsmål (${FAQ_SALG_REST.length} mere)`}
          </button>
        </>
      )}
    </div>
  );
}
