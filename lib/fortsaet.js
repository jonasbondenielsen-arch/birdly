// =====================================================================
// Klient-lag mod Edge Function `fortsaet` ("Behold din overvågning").
//
// Birdly har KUN anon-nøglen; alt privilegeret ligger i Edge Function'en, som kører
// service-role internt. Samme model som lib/privatOpgave.js og lib/feedback.js.
//
// ⚠️ EGET TOKEN. `fortsaet_token` (12 hex) er IKKE list_token. Opgaveliste-tokenet
// står i hver eneste mail vi har sendt og i kundens browserhistorik — genbrugt her
// kunne alle der har set én opgaveliste-mail opsige abonnementet. Send aldrig
// list_token til denne function, og brug aldrig fortsaet_token mod de andre.
//
// ⚠️ DER TRÆKKES ALDRIG PENGE HERFRA. Ingen Frisbii, ingen betalingssession, intet
// kortfelt. Kunden krydser af, Jonas fakturerer i hånden. Findes der en dag en
// betalingsknap på siden, skal den IKKE lægges i denne fil — så er det et andet flow.
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function kald(body) {
  return fetch(`${SUPABASE_URL}/functions/v1/fortsaet`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

// ⚠️ ÉT FEJLSVAR FOR ALT. Ukendt token, udløbet link og serverfejl svarer ENS udadtil
// ({ ok: false }), præcis som Edge Function'en gør det. Skelnede siden mellem dem,
// kunne man gætte sig til gyldige tokens ved at læse forskellen.
async function svar(body, fallback = { ok: false }) {
  if (!SUPABASE_URL || !ANON || !body?.token) return fallback;
  try {
    const res = await kald(body);
    return await res.json().catch(() => fallback);
  } catch {
    return fallback;
  }
}

/**
 * Sidens tilstand: fornavn, firma, slutdato, dage til (negativ = udløbet), det
 * DEDUPEREDE antal opgaver, og om der allerede er svaret om netop denne slutdato.
 *
 * ⚠️ Kaldes server-side ved første render, så kunden aldrig ser et skema blinke frem
 * og forsvinde igen. Samme greb som hentKort3Status().
 *
 * ⚠️ SIDE-EFFEKT: Edge Function'en logger `side_aabnet` her — men kun første gang pr.
 * slutdato, så et genindlæst faneblad ikke tæller som en ny åbning.
 */
export const hentFortsaet = (token) => svar({ handling: "hent", token });

/**
 * Kunden vælger en plan. `plan` er "aar" eller "maaned" — de samme to værdier som
 * check-constraint'en i 0083 tillader.
 *
 * ⚠️ SAMTYKKET ER IKKE PYNT. Et ja udløser en faktura, altså en aftaleindgåelse.
 * Sendes samtykke=false, skriver serveren INTET — ikke engang et udkast. Kaldet må
 * derfor aldrig sendes med et hårdkodet true "fordi knappen alligevel er spærret".
 */
export const vaelgPlan = (token, plan, samtykke) =>
  svar({ handling: "fortsaet", token, plan, samtykke: samtykke === true });

/**
 * "Nej tak" trykket — FØR spørgeskemaet er udfyldt.
 *
 * ⚠️ Gemmer intet svar; kun en hændelse. Grunden kender vi først efter skemaet, og
 * `churn_grund` er obligatorisk i basen. Men forlader hun siden nu, skal vi stadig
 * vide at hun ville sige nej — ellers er tavsheden et hul i tragten.
 */
export const afvis = (token) => svar({ handling: "afvis", token });

/** Spørgeskemaet indsendes. Først HER står afvisningen som et svar i basen. */
export const gemFeedback = (token, felter) =>
  svar({ handling: "feedback", token, ...felter });
