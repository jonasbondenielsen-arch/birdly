// ============================================================================
// SOCIALE PROFILER — ét sted, og et ikon vises KUN når adressen findes.
//
// ⚠️ HVORFOR DEN FINDES. Footeren havde `href="[FACEBOOK-URL]"` og tre lignende
// stående som rå placeholdere. De var ikke bare tomme: fordi de ikke starter med
// http, læste browseren dem som RELATIVE stier, så et klik landede på
// birdly.dk/[FACEBOOK-URL] — verificeret 404 på alle fire, live. Fire døde links i
// footeren på hver eneste side.
//
// ⚠️ ET DØDT IKON ER VÆRRE END INTET IKON. Footeren er dér man kigger når man
// overvejer om en virksomhed er ægte. Et ikon der fører til en fejlside svarer på det
// spørgsmål — bare forkert.
//
// ⚠️ HVER ADRESSE SKRIVES UD FOR SIG. Next inliner kun process.env-opslag den kan se
// statisk; `process.env["NEXT_PUBLIC_" + navn]` ville blive undefined i browseren, og
// så ville alle ikoner forsvinde permanent uden at nogen forstod hvorfor.
//
// ⚠️ NEXT_PUBLIC-PRÆFIKS ER PÅKRÆVET HER. Footeren importeres af Forside.js, som er
// en klient-komponent — så den bundles til browseren. Uden præfikset er værdien tom
// i klienten, uanset hvad der står i Vercel.
//
// Navngivningen spejler admin/edge (BIRDLY_FACEBOOK_URL m.fl.), så de to sider af
// systemet kan konfigureres af den samme person uden at skulle huske to mønstre.
//
// SÅDAN TÆNDES DE: sæt variablen i Vercel (Production) på `birdly`-projektet og
// redeploy. Ikonet dukker op af sig selv. Ingen kodeændring.
// ============================================================================

const rens = (v) => {
  const s = String(v || "").trim();
  // ⚠️ KRÆVER http(s). Præcis den fejl vi rydder op efter: en værdi uden protokol
  // bliver til en relativ sti og dermed et 404. Hellere intet ikon end det igen.
  return /^https?:\/\//i.test(s) ? s : "";
};

export const SOCIALE = [
  { key: "facebook", navn: "Facebook", url: rens(process.env.NEXT_PUBLIC_BIRDLY_FACEBOOK_URL) },
  { key: "instagram", navn: "Instagram", url: rens(process.env.NEXT_PUBLIC_BIRDLY_INSTAGRAM_URL) },
  { key: "google", navn: "Google anmeldelser", url: rens(process.env.NEXT_PUBLIC_BIRDLY_GOOGLE_URL) },
  { key: "trustpilot", navn: "Trustpilot", url: rens(process.env.NEXT_PUBLIC_BIRDLY_TRUSTPILOT_URL) },
].filter((s) => s.url);
