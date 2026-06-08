import { insertRow } from "../../../lib/supabase";

// POST /api/waitlist — offentlig venteliste-tilmelding (prelaunch).
// Validerer e-mail server-side, inserter via anon-nøglen (anon INSERT-policy på
// waitlist), og sender en kort bekræftelsesmail fra venteliste@birdly.dk via Resend.
// Mail er gated bag RESEND_API_KEY — uden nøgle springes afsendelsen over (stub),
// men tilmeldingen gemmes stadig. Ingen hård åbnings-dato loves i mailen.

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const WAITLIST_FROM = process.env.WAITLIST_MAIL_FROM || "Birdly <venteliste@birdly.dk>";

async function sendConfirmation(email) {
  if (!RESEND_API_KEY) {
    console.log("[waitlist] STUB bekræftelsesmail (ingen RESEND_API_KEY) til", email);
    return;
  }
  const text =
    "Hej!\n\n" +
    "Tak — du er nu skrevet på ventelisten til Birdly. 🕊️\n\n" +
    "Vi åbner snart, og du er blandt de første, vi giver besked. Så snart vi er klar, flyver vi dine udbud direkte i lommen på dig.\n\n" +
    "Vi glæder os til at se dig.\n\n" +
    "Venlig hilsen\nBirdly";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: WAITLIST_FROM, to: [email], subject: "Du er på ventelisten 🕊️", text }),
    });
  } catch (e) {
    console.error("[waitlist] Resend fejl:", e?.message || e);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return Response.json({ error: "Skriv en gyldig e-mail." }, { status: 400 });

  const fag = body.fag ? String(body.fag).trim() || null : null;
  const uses_service = body.uses_service === true;
  const service_name = uses_service && body.service_name ? String(body.service_name).trim().slice(0, 200) || null : null;

  try {
    await insertRow("waitlist", { email, fag, uses_service, service_name });
  } catch (e) {
    console.error("[waitlist] insert fejl:", e?.message || e);
    return Response.json({ error: "Kunne ikke skrive dig på listen lige nu. Prøv igen om lidt." }, { status: 500 });
  }

  await sendConfirmation(email);
  return Response.json({ ok: true });
}
