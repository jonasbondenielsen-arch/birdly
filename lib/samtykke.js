"use client";

// ============================================================================
// SAMTYKKE — én sandhed om hvad der må køre.
//
// Cookiepolitikken lover: "Statistik- og markedsføringscookies sættes FØRST, når du
// aktivt har accepteret, og de aktiveres ikke, hvis du afviser." Denne fil er dét løfte
// omsat til kode.
//
// ⚠️ AFVISNING SKAL FAKTISK FORHINDRE — ikke bare huske et nej.
// Den almindelige fejl er at indlæse pixel'en og derefter "respektere" valget. Så er
// cookien allerede sat og kaldet allerede sendt. Derfor er rækkefølgen her omvendt:
// intet marketing-script eksisterer i DOM'en før samtykket er givet, og trækkes
// samtykket tilbage, fjernes scriptet OG cookierne igen.
//
// LAGRING: localStorage, ikke en cookie. Selve samtykket er "nødvendigt" og må gemmes
// uden samtykke — men en cookie ville blive sendt med hver eneste HTTP-anmodning helt
// uden grund.
// ============================================================================

const NOEGLE = "birdly_samtykke";
const VERSION = 1; // bump ⇒ alle bliver spurgt igen (fx hvis kategorierne ændrer sig)

export const KATEGORIER = [
  {
    id: "noedvendige",
    navn: "Nødvendige",
    tekst: "Får siden til at virke — dit samtykkevalg og din session. Kan ikke fravælges.",
    laast: true,
  },
  {
    id: "statistik",
    navn: "Statistik",
    tekst: "Anonyme tal om hvordan siden bruges, så vi kan gøre den bedre.",
  },
  {
    id: "marketing",
    navn: "Marketing",
    tekst: "Måler om vores annoncer virker, og lader os vise dem til de rigtige. Sætter Meta Pixel.",
  },
];

const INTET = { noedvendige: true, statistik: false, marketing: false };

/** Læser det gemte valg. null = der er ikke taget stilling endnu (⇒ vis banneret). */
export function hentSamtykke() {
  if (typeof window === "undefined") return null;
  try {
    const raa = window.localStorage.getItem(NOEGLE);
    if (!raa) return null;
    const v = JSON.parse(raa);
    if (v.version !== VERSION) return null; // gammelt valg ⇒ spørg igen
    return { ...INTET, ...v.valg, _tid: v.tid };
  } catch {
    return null;
  }
}

/** Har brugeren sagt ja til en kategori? Ukendt ⇒ NEJ. Aldrig et gæt til vores fordel. */
export function maa(kategori) {
  const s = hentSamtykke();
  return !!(s && s[kategori]);
}

export function gemSamtykke(valg) {
  const fuldt = { ...INTET, ...valg, noedvendige: true };
  try {
    window.localStorage.setItem(NOEGLE, JSON.stringify({ version: VERSION, valg: fuldt, tid: new Date().toISOString() }));
  } catch { /* privat browsing e.l. — så gælder valget kun denne session */ }

  // ⚠️ TILBAGEKALDELSE SKAL RYDDE OP. Sagde brugeren ja og siden nej, ligger Metas
  // cookies der stadig og fortsætter med at identificere hende. At "huske nej" uden at
  // rydde er ikke et tilbagekaldt samtykke — det er kun et løfte om ikke at spørge igen.
  if (!fuldt.marketing) ryddMarketing();

  // Lad resten af siden reagere uden en genindlæsning.
  window.dispatchEvent(new CustomEvent("birdly-samtykke", { detail: fuldt }));
  return fuldt;
}

/** Nulstil, så banneret vises igen (bruges af "Skift dit valg"-linket). */
export function nulstilSamtykke() {
  try { window.localStorage.removeItem(NOEGLE); } catch {}
  ryddMarketing();
  window.dispatchEvent(new CustomEvent("birdly-samtykke", { detail: null }));
}

// Alle domæne-varianter cookien KAN være sat på. En cookie slettes kun af et Set-Cookie
// med præcis samme domain — og Meta sætter _fbp på det registrerbare domæne
// (.birdly.dk), ikke på værtsnavnet. Sletter man derfor blot på window.location.hostname,
// rammer man ".www.birdly.dk" og cookien overlever. Vi går derfor hele vejen op.
function domaeneVarianter() {
  const dele = window.location.hostname.split(".");
  const ud = [];
  // Stopper før det sidste led: ".dk" er et offentligt suffiks og afvises af browseren.
  for (let i = 0; i < dele.length - 1; i++) {
    const d = dele.slice(i).join(".");
    ud.push(d, `.${d}`);
  }
  return ud;
}

// Fjerner Metas cookies og de gemte attributions-parametre. Vi kan ikke slette cookies
// sat på et andet domæne, men _fbp og _fbc er FØRSTEparts og hører os til.
function ryddMarketing() {
  try {
    const varianter = domaeneVarianter();
    for (const navn of ["_fbp", "_fbc"]) {
      document.cookie = `${navn}=; Max-Age=0; path=/`;
      for (const d of varianter) {
        document.cookie = `${navn}=; Max-Age=0; path=/; domain=${d}`;
      }
    }
    window.sessionStorage.removeItem("birdly_attribution");
  } catch {}
}
