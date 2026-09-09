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
//
// ⚠️ LISTEN ER EN PROP MED DANSK SOM DEFAULT — OG DET ER IKKE KOSMETIK.
// Den britiske FAQ lå først i sin egen komponent, `FaqListeUk.js`. Det virkede,
// men det kostede: Sektioner.js skulle importere den, og en statisk import af en
// KLIENT-komponent kan bundleren ikke ryste ud igen. Resultatet var en ekstra
// `<script src=…>` på /priser og /sadan-virker-det — danske sider der aldrig
// renderer en britisk FAQ. Målt, ikke gættet: DK-diffen fangede det.
//
// Det er samme klasse af fejl som den nye eksport i lib/markets.js 09-09-2026:
// en tilføjelse for ét markeds skyld flytter modulgrafen for alle de andre.
// Med props kommer teksten ind som DATA fra serverkomponenten, og modulgrafen
// er præcis den samme som før.
//
// ⚠️ DANMARK ER UÆNDRET BY CONSTRUCTION. `<FaqListe />` uden props giver de
// samme lister og de samme knap-etiketter, tegn for tegn, som da de stod
// inline. Bevist med renderet-HTML-diff, ikke ved gennemlæsning.
// ============================================================================

// Husets danske knap-etiketter. De stod inline før og står her nu — samme
// strenge, samme sammensætning: "Se alle spørgsmål (5 mere)".
const DA_ETIKETTER = {
  merePrefix: "Se alle spørgsmål",
  mereSuffix: "mere",
  skjul: "Skjul de øvrige spørgsmål",
};

export default function FaqListe({
  top = FAQ_SALG_TOP,
  rest = FAQ_SALG_REST,
  etiketter = DA_ETIKETTER,
}) {
  const [visAlle, setVisAlle] = useState(false);

  return (
    <div className="sg-faq">
      {top.map((f) => (
        <details key={f.sp}>
          <summary>{f.sp}<span className="sg-pm" aria-hidden="true">+</span></summary>
          <div className="sg-faq-svar">{f.svar}</div>
        </details>
      ))}

      {rest.length > 0 && (
        <>
          {/* `hidden` frem for at undlade at rendere: indholdet er i dokumentet
              uanset, og browseren skjuler det. Se noten øverst. */}
          <div hidden={!visAlle}>
            {rest.map((f) => (
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
            {visAlle ? etiketter.skjul : `${etiketter.merePrefix} (${rest.length} ${etiketter.mereSuffix})`}
          </button>
        </>
      )}
    </div>
  );
}
