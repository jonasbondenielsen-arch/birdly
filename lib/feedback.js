// Det korte feedback-skema mod Edge Function feedback-forlaeng. Adgang = kundens
// eget list_token, samme model som samlesiden — ingen ny token-mekanik.
//
// ⚠️ DET GAMLE 9-SPØRGSMÅLS-SKEMA ER SLETTET (13-08-2026). hentForlaengStatus() og
// gemFeedback() lå her og kaldte samme funktion UDEN `skema`. De to sider kunne bede
// den samme kunde om at anmelde os to gange med hvert sit skema, og flaget der styrede
// det gamle er fjernet. Edge Function'en kræver nu `skema: "kort3"` og afviser alt
// andet — derfor er der ikke længere en kaldevej uden det.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function kald(body) {
  return fetch(`${SUPABASE_URL}/functions/v1/feedback-forlaeng`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

// ---------------------------------------------------------------------------
// DET KORTE SKEMA (4 spørgsmål) — /fb/{kode} → /feedback/{token}
// ---------------------------------------------------------------------------
// Samme Edge Function, samme token-model; `skema: "kort3"` er hele forskellen.
// Udelades feltet, svarer funktionen som det lange 9-felts-skema — derfor sendes det
// ALTID med her, også på hent, hvor det afgør hvilken afbryder der læses.
const SKEMA = "kort3";

/** Tilstand til det korte skema: prøve eller betalende, allerede svaret, aktiv. */
export async function hentKort3Status(token) {
  if (!SUPABASE_URL || !ANON || !token) return { ok: false, aktiv: false };
  try {
    const res = await kald({ action: "hent", skema: SKEMA, token });
    return await res.json().catch(() => ({ ok: false, aktiv: false }));
  } catch {
    return { ok: false, aktiv: false };
  }
}

/**
 * Gemmer de tre svar + markedsføringssamtykket. Serveren afgør selv om der skal
 * forlænges — klienten beder aldrig om dage.
 */
export async function gemKort3(token, { svar, markedsfoering_ok }) {
  if (!SUPABASE_URL || !ANON || !token) return { ok: false };
  try {
    const res = await kald({ action: "gem", skema: SKEMA, token, svar, markedsfoering_ok });
    return await res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}
