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

// ---------------------------------------------------------------------------
// Samlesiden "Mine opgaver" (Spor 3b). list_token er kundens EGET token (ikke et
// udbuds-token) og resolver til hele hendes aktive liste + hendes kriterier.
// ---------------------------------------------------------------------------

// Henter kundens opgaver. Kaster ALDRIG — siden viser en pæn ugyldig/udløbet-tilstand.
// `intern` er en ugennemsigtig, signeret markør fra admin (birdly-admin/lib/internMarkoer.js).
// Dette repo hverken laver eller forstår den — den videresendes ordret, og Edge
// Function'en afgør om den er ægte. Uden markør er adfærden NØJAGTIG som før.
export async function fetchMyTasks(token, intern = null) {
  if (!token || !SUPABASE_URL) return { found: false };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-my-tasks?token=${encodeURIComponent(token)}` +
        (intern ? `&intern=${encodeURIComponent(intern)}` : ""),
      { headers: AUTH(), cache: "no-store" }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.found) return { found: false, expired: !!body.expired };
    return body;
  } catch {
    return { found: false };
  }
}

// Forhåndsvisning af et kriterie-forslag. LÆSER KUN — intet gemmes.
// → { nu, efter, uden_beloeb, forsvinder[], kommer_til[] }
export async function previewCriteria(token, forslag) {
  const res = await fetch(fnUrl("preview-criteria"), {
    method: "POST",
    headers: { ...AUTH(), "Content-Type": "application/json" },
    body: JSON.stringify({ token, forslag }),
  });
  const b = await res.json().catch(() => ({}));
  if (!res.ok || b.found === false) throw new Error(b.error || "Kunne ikke beregne forhåndsvisningen.");
  return b;
}

// Gemmer kriterierne (og kører re-match). bekraeft_nul skal sættes eksplicit hvis
// forslaget giver nul opgaver — serveren afviser ellers med error:"giver_nul".
export async function saveMyCriteria(token, forslag, bekraeft_nul = false) {
  const res = await fetch(fnUrl("save-my-criteria"), {
    method: "POST",
    headers: { ...AUTH(), "Content-Type": "application/json" },
    body: JSON.stringify({ action: "gem", token, forslag, bekraeft_nul }),
  });
  return res.json().catch(() => ({ ok: false, error: "internal" }));
}

// Ruller kriterierne tilbage til seneste snapshot.
export async function undoMyCriteria(token) {
  const res = await fetch(fnUrl("save-my-criteria"), {
    method: "POST",
    headers: { ...AUTH(), "Content-Type": "application/json" },
    body: JSON.stringify({ action: "fortryd", token }),
  });
  return res.json().catch(() => ({ ok: false, error: "internal" }));
}

// Valgfri grund og/eller valgfri 1-5 smiley til en fjernet opgave. Kaldes EFTER
// fjernelsen og må aldrig blokere den — fejler den, beholder kunden stadig sin
// ryddede liste.
//
// De to signaler sendes i hver sit kald, fordi de gives i hvert sit trin: grunden med
// det samme, smileyen bagefter hvis kunden gider. Serveren fletter dem ind i samme
// række, så andet kald ikke tørrer første ud. Begge er valgfrie hver for sig — {grund}
// alene, {rating} alene eller begge er alle gyldige.
export async function sendDismissReason(token, matchId, { grund = null, rating = null } = {}) {
  try {
    const res = await fetch(fnUrl("save-my-criteria"), {
      method: "POST",
      headers: { ...AUTH(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grund", token, match_id: matchId, grund, rating }),
    });
    const b = await res.json().catch(() => ({}));
    return !!b.ok;
  } catch {
    return false;
  }
}

// "Dette er relevant" på en opgave i lagt-til-side-bunken. Fortæller systemet at et
// lært træk overskjuler; serveren relakserer de træk der ramte opgaven, og de skjuler
// aldrig igen. Må aldrig blokere UI'et — fejler den, bliver opgaven stadig vist.
export async function markerSomRelevant(token, matchId) {
  try {
    const res = await fetch(fnUrl("save-my-criteria"), {
      method: "POST",
      headers: { ...AUTH(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "relevant", token, match_id: matchId }),
    });
    const b = await res.json().catch(() => ({}));
    return !!b.ok;
  } catch {
    return false;
  }
}

// Slå SMS til/fra. Mail kan IKKE slås fra — serveren sætter altid notify_email=true.
// Kaster ikke: fejler den, står kontakten som før og kunden kan prøve igen.
export async function saetSmsBesked(token, tilstand) {
  try {
    const res = await fetch(fnUrl("save-my-criteria"), {
      method: "POST",
      headers: { ...AUTH(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "notify", token, notify_sms: !!tilstand }),
    });
    const b = await res.json().catch(() => ({}));
    return b.ok === true ? b : null;
  } catch {
    return null;
  }
}

// Kundens eget tilvalg af private opgaver.
//
// ⚠️ SAMTYKKE, IKKE EN INDSTILLING. Kunden tilmeldte sig OFFENTLIGE UDBUD; private
// opgaver fra privatpersoner er et andet produkt (markedsføringsloven §10). Default
// er FRA, og fravalg skal virke lige så let som tilvalg — samme kald begge veje.
//
// Kaster ikke: fejler den, står kontakten som før og kunden kan prøve igen.
export async function saetPrivateOpgaver(token, tilstand) {
  try {
    const res = await fetch(fnUrl("save-my-criteria"), {
      method: "POST",
      headers: { ...AUTH(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "private_opgaver", token, wants_private_opgaver: !!tilstand }),
    });
    const b = await res.json().catch(() => ({}));
    return b.ok === true ? b : null;
  } catch {
    return null;
  }
}

// "Ikke interessant — for høj værdi" på et nær-match-forslag. Bruger kundens eget
// list_token som adgang, præcis som resten af samlesiden — ingen ny token-model.
// Må aldrig blokere UI'et: forslaget er allerede fjernet lokalt når dette kaldes.
export async function afvisNaerMatch(token, shareToken) {
  try {
    const res = await fetch(fnUrl("save-my-criteria"), {
      method: "POST",
      headers: { ...AUTH(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "naer_match_afvis", token, share_token: shareToken }),
    });
    const b = await res.json().catch(() => ({}));
    return !!b.ok;
  } catch {
    return false;
  }
}

// Fjerner (eller gendanner) én opgave fra listen — soft, matchen slettes aldrig.
export async function dismissTask(token, matchId, fjernet = true) {
  const res = await fetch(fnUrl("save-my-criteria"), {
    method: "POST",
    headers: { ...AUTH(), "Content-Type": "application/json" },
    body: JSON.stringify({ action: "fjern", token, match_id: matchId, fjernet }),
  });
  return res.json().catch(() => ({ ok: false, error: "internal" }));
}

// Returnerer { found, notice, customer, why, expires_at, files } eller { found:false }.
// Kaster ALDRIG — delesiden viser en pæn "ugyldigt link"-tilstand på found:false.
export async function fetchSharedNotice(token, intern = null) {
  if (!token || !SUPABASE_URL) return { found: false };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-shared-notice?token=${encodeURIComponent(token)}` +
        (intern ? `&intern=${encodeURIComponent(intern)}` : ""),
      { headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` }, cache: "no-store" }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.found) return { found: false, expired: !!body.expired };
    return body;
  } catch {
    return { found: false };
  }
}
