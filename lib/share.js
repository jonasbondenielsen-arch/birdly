// =====================================================================
// Deleside-opslag (Fase D) mod Edge Function get-shared-notice.
//
// get-shared-notice er offentlig (verify_jwt=false) med service-role internt —
// birdly har KUN anon-nøglen. Token'en resolver til ÉN match (udbud + kunde).
// Kaldes server-side fra delesiden (ingen login).
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function fnUrl(name) {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}
const AUTH = () => ({ apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` });

// Vedhæft en fil til bud-udkastet (privat bucket via service-role Edge Function).
// Server-side type-/størrelses-validering — frontend er kun en bekvemmelighed.
export async function uploadTenderFile(token, section, file) {
  const fd = new FormData();
  fd.append("token", token);
  fd.append("section", section);
  fd.append("file", file);
  const res = await fetch(fnUrl("upload-tender-file"), { method: "POST", headers: AUTH(), body: fd });
  const b = await res.json().catch(() => ({}));
  if (!res.ok || !b.ok) throw new Error(b.error || "Upload fejlede.");
  return b.file; // { id, section, file_name, size_bytes, created_at }
}

// Fjern en vedhæftet fil (kun egne — scoped til token/match server-side).
export async function deleteTenderFile(token, fileId) {
  const res = await fetch(fnUrl("upload-tender-file"), {
    method: "POST",
    headers: { ...AUTH(), "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", token, fileId }),
  });
  const b = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(b.error || "Kunne ikke slette filen.");
  return true;
}

// OFFENTLIG udbuds-opslag (uden token) mod Edge Function get-public-notice — til
// /dagens-udbud/[id]. Slår ét udbud op på dets id; returnerer { found, notice } mens
// fristen er fremme, ellers { found:false, expired:true }. Ingen kunde-data, intet
// token. Kaster ALDRIG — siden viser en pæn udløbet-tilstand på found:false.
export async function fetchPublicNotice(id) {
  if (!id || !SUPABASE_URL) return { found: false };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-public-notice?id=${encodeURIComponent(id)}`,
      { headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` }, cache: "no-store" }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.found) return { found: false, expired: !!body.expired };
    return body;
  } catch {
    return { found: false };
  }
}

// Returnerer { found, notice, customer, why, expires_at, files } eller { found:false }.
// Kaster ALDRIG — delesiden viser en pæn "ugyldigt link"-tilstand på found:false.
export async function fetchSharedNotice(token) {
  if (!token || !SUPABASE_URL) return { found: false };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-shared-notice?token=${encodeURIComponent(token)}`,
      { headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` }, cache: "no-store" }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.found) return { found: false, expired: !!body.expired };
    return body;
  } catch {
    return { found: false };
  }
}
