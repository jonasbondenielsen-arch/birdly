// Feedback-skemaet mod Edge Function feedback-forlaeng. Adgang = kundens eget
// list_token, samme model som samlesiden — ingen ny token-mekanik.

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

/** Tilstand til siden: er tilbuddet aktivt, er det brugt, hvilken slutdato. */
export async function hentForlaengStatus(token) {
  if (!SUPABASE_URL || !ANON || !token) return { ok: false, aktiv: false };
  try {
    const res = await kald({ action: "hent", token });
    return await res.json().catch(() => ({ ok: false, aktiv: false }));
  } catch {
    return { ok: false, aktiv: false };
  }
}

/**
 * Gemmer besvarelsen og udløser forlængelsen. Kaster ikke — komponenten viser en
 * fejl og lader svarene stå, så kunden ikke skal starte forfra.
 */
export async function gemFeedback(token, payload) {
  if (!SUPABASE_URL || !ANON || !token) return { ok: false };
  try {
    const res = await kald({ action: "gem", token, ...payload });
    return await res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}
