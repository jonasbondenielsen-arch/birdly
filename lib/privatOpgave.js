// =====================================================================
// Klient-lag mod Edge Function `privat-opgave`.
//
// Birdly har KUN anon-nøglen; al privilegeret adgang ligger i Edge Function'en, som
// kører service-role internt. To slags token — og de må ALDRIG kunne bruges i
// hinandens sted:
//
//   share_token  → VIRKSOMHEDEN, ét pr. opgave_match
//   list_token   → OPRETTEREN, ét pr. menneske, og det UDLØBER
//
// ⚠️ KONTAKTOPLYSNINGER KOMMER KUN MED, NÅR EN PLADS ER TAGET. Serveren afgør det —
// denne fil kan ikke bede om dem, og skal ikke forsøge. Gætter du på at feltet er der,
// bygger du en visning der lyver når det ikke er.
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const url = () => `${SUPABASE_URL}/functions/v1/privat-opgave`;
const AUTH = () => ({
  apikey: ANON || "",
  Authorization: `Bearer ${ANON || ""}`,
  "Content-Type": "application/json",
});

async function kald(body) {
  const res = await fetch(url(), { method: "POST", headers: AUTH(), body: JSON.stringify(body), cache: "no-store" });
  const b = await res.json().catch(() => ({}));
  // Fejlkoden føres med op, fordi siden viser HELT forskellige ting ved "optaget",
  // "udloebet" og "link_udloebet". Et generisk "der skete en fejl" ville efterlade
  // virksomheden i tvivl om hun mistede opgaven eller om systemet var i stykker.
  if (!b || b.ok !== true) {
    const e = new Error(b?.error || "ukendt_fejl");
    e.kode = b?.error || "ukendt_fejl";
    e.data = b;
    throw e;
  }
  return b;
}

// ---------- OPRETTELSE ----------

// Opretter opgaven og returnerer opretterens list_token (magic link til hendes egen
// opgaveliste). Kaster ved fejl — formularen viser beskeden.
export const opretOpgave = (felter) => kald({ action: "opret", ...felter });

// ---------- VIRKSOMHEDEN ----------

export const hentLead = (token) => kald({ action: "lead", token });

// Reserverer en plads OG låser kontaktoplysningerne op i samme svar. Ét kald, fordi to
// (reservér, hent-så-kontakt) ville kunne fejle imellem hinanden og efterlade en
// virksomhed med en brugt plads og intet telefonnummer.
export const reserverPlads = (token) => kald({ action: "reserver", token });

export const afvisLead = (token) => kald({ action: "afvis", token });

export const fjernLead = (token, outcome, kommentar) =>
  kald({ action: "fjern", token, outcome, kommentar });

// ---------- OPRETTEREN ----------

export const hentTilRedigering = (list_token, opgave_id) =>
  kald({ action: "hent_redigering", list_token, opgave_id });

export const redigerOpgave = (list_token, opgave_id, felter) =>
  kald({ action: "rediger", list_token, opgave_id, ...felter });


export const hentMinListe = (list_token) => kald({ action: "liste", list_token });
export const opgaveLoest = (list_token, opgave_id) => kald({ action: "loest", list_token, opgave_id });
export const opgaveIkkeLoest = (list_token, opgave_id, grund) =>
  kald({ action: "ikke_loest", list_token, opgave_id, grund });
export const genaabnOpgave = (list_token, opgave_id) => kald({ action: "genaabn", list_token, opgave_id });

// Feedback efter "Opgaven er loest". Alle felter er valgfrie - hun maa lukke
// skemaet uden at svare, og opgaven er lukket alligevel.
export const sendOpgaveFeedback = (list_token, opgave_id, svar) =>
  kald({ action: "feedback", list_token, opgave_id, ...svar });

// ---------- BILLEDER ----------

// ⚠️ EGEN FUNCTION, EGET KALD. Billeder er multipart; resten af dette lag er JSON.
// Blandes de, skal `kald()` kunne to ting, og den ene af dem dårligt.
//
// ⚠️ UPLOADES EFTER OPRETTELSEN, ikke sammen med den. Opgaven skal eksistere for at
// et billede kan høre til den, og rækkefølgen har en pris værd at kende: fejler en
// upload, HAR hun stadig sin opgave. Omvendt ville en fejlet upload kunne koste hende
// hele opgaven — og det er det værste udfald af de to.
export async function uploadOpgaveBillede(listToken, opgaveId, fil) {
  const form = new FormData();
  form.append("list_token", listToken);
  form.append("opgave_id", opgaveId);
  form.append("file", fil);
  const res = await fetch(`${SUPABASE_URL}/functions/v1/opgave-billeder`, {
    method: "POST",
    // ⚠️ INGEN Content-Type-header. Browseren skal selv sætte den med sin egen
    // multipart-boundary; sætter vi den i hånden, kan serveren ikke finde grænsen og
    // hele uploaden fejler.
    headers: { apikey: ANON || "", Authorization: `Bearer ${ANON || ""}` },
    body: form,
  });
  const b = await res.json().catch(() => ({}));
  if (!b || b.ok !== true) {
    const e = new Error(b?.error || "upload_fejlede");
    e.kode = b?.error || "upload_fejlede";
    throw e;
  }
  return b.billede;
}

// ⚠️ RAMMER `opgave-billeder`, IKKE `privat-opgave`. Slette-grenen bor sammen med
// upload'en, fordi begge skal afgøre ejerskab på præcis samme måde. `kald()` ovenfor
// peger på en anden function og ville svare "ukendt_handling" her.
export async function sletOpgaveBillede(listToken, billedeId) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/opgave-billeder`, {
    method: "POST",
    headers: {
      apikey: ANON || "",
      Authorization: `Bearer ${ANON || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "slet", list_token: listToken, billede_id: billedeId }),
  });
  const b = await res.json().catch(() => ({}));
  if (!b || b.ok !== true) throw new Error(b?.error || "kunne_ikke_slette");
  return b;
}
