import {
  Hero, BevisBjaelke, Problemet, Motoren,
  RigtigeOpgaver, OffentligeOpgaver, Overgang, IkkePortal, SlutCta,
} from "../../components/salg/Sektioner";
import { hentOpgaveTal } from "../../lib/opgaveTal";
import { baseUrl, MARKEDER } from "../../lib/markets";

// ============================================================================
// DET ENGELSKE BIRDLY — getbirdly.co.uk (UK Fase A, del 2)
//
// ⚠️ EGET STATISK TRÆ, IKKE EN DYNAMISK FORSIDE. `proxy.js` rewriter britiske
// værter hertil, så adressen udadtil stadig er getbirdly.co.uk/. Alternativet
// var at lade `/` læse `headers()` og vælge marked pr. request — men det ville
// gøre den DANSKE forside dynamisk og koste dens cache. Med et rewrite bliver
// begge markeder statisk genereret, og DK's renderingssti er bogstaveligt talt
// urørt. Det er også derfor DK kan bevises byte-identisk: den kode kører ikke
// et andet sted, den kører præcis som før.
//
// ⚠️ SAMME KOMPONENTER SOM DANMARK. Der er ikke bygget en UK-forside; der er
// sendt `marked="GB"` ind i husets egne sektioner, som slår teksten op i
// ordbogen. En kopi ville drive fra den danske i samme øjeblik nogen rettede
// den ene.
// ============================================================================

const GB = MARKEDER.GB;

export const metadata = {
  title: "Get more cleaning and service contracts | Birdly",
  description:
    "Birdly finds public and private work that fits your business — and sends new matches straight to your phone.",
  // ⚠️ CANONICAL PEGER PÅ getbirdly.co.uk, ikke på /uk. Stien er intern; det
  // er værten kunden ser, og det er den Google skal indeksere.
  alternates: { canonical: baseUrl("GB") + "/" },
  // ⚠️ INGEN INDEKSERING FØR MARKEDET ER LANCERET. GB er DRAFT: domænet peger
  // ingen steder, priserne er ikke oprettet i Frisbii, og juraen er DRAFT. Et
  // indekseret site i den tilstand ville lokke folk ind på noget der ikke kan
  // købes. Fjernes når pre-live-tjeklisten er grøn.
  robots: GB.lanceret ? undefined : { index: false, follow: false },
};

export default async function UkForside() {
  // ⚠️ BEVIS-BJÆLKEN ER SLUKKET FOR GB, OG DET ER EN BESLUTNING (09-09-2026).
  //
  // Bjælken er ikke bare tal — den er en AKTIVITETS-PÅSTAND: "Birdly is already
  // keeping watch", "2× a day", "new in the last 7 days". For GB har ingesten
  // kørt NUL gange og kilden (FTS) er slukket, så hver af de påstande er usand
  // i dag. Selv de sande snapshot-tal forfalder: de 301 britiske udbud kom ind
  // i ét backfill, så "new in the last 7 days" ville svare 301 og derefter
  // falde til 0 uden at noget var gået galt.
  //
  // ⚠️ HVORFOR EN EKSPLICIT GATE OG IKKE BARE `hentOpgaveTal`s selvkontrol.
  // Den kontrol virker ved et TILFÆLDE i dag: GB-domænerne er slukkede, så
  // funktionen svarer DK, uenigheden opdages, og bjælken forsvinder. Men den
  // dag DNS peges og domænerne tændes, ville bjælken TÆNDE AF SIG SELV med
  // frosne tal — uden at nogen havde besluttet det. Gaten skal hænge på om
  // motoren kører, ikke på om domænet svarer.
  //
  // `GB.dataLever` sættes til true når FTS kører live. Så bliver bjælken
  // ægte af sig selv, og der er ingen kode at huske at ændre.
  // ⚠️ LÆSES SOM DATA, IKKE GENNEM EN NY EKSPORTERET FUNKTION.
  // Første forsøg lagde en `dataLever()`-hjælper i lib/markets.js — og DA
  // FLYTTEDE DEN DANSKE FORSIDE SIG. Ikke indholdet: titel, tal og FAQ-schema
  // var identiske, men RSC-strømmens række-id'er blev nummereret om (FAQ-
  // schemaet gik fra række "f" til "10", IconMark modsat). En ny eksport
  // ændrer modulets form, og bundleren grupperer chunks anderledes.
  // Kontrolprøven main-mod-main var ren, så det var ikke byggestøj.
  // Nøglen aflæses derfor direkte på markedet — samme oplysning, ingen ny
  // eksport, DK uberørt.
  const tal = GB.dataLever ? await hentOpgaveTal("GB", baseUrl("GB")) : null;

  return (
    <div className="sg" lang="en-GB">
      {/* ⚠️ SEKUNDÆREN PEGER PÅ SIDENS EGEN "HOW IT WORKS", ikke på
          /sadan-virker-det. Den danske støtteside findes ikke på engelsk, og
          en britisk besøgende der trykker "See how it works" skal ikke lande i
          dansk tekst. Ankeret virker, fordi Motoren står længere nede på
          samme side. Den dag UK får sin egen støtteside, er det den ene prop. */}
      <Hero marked="GB" funnelHref="/uk/start" sekundaerHref="#hvordan" />
      {/* Renderer sig selv væk når `tal` er null — se noten ovenfor. */}
      <BevisBjaelke marked="GB" tal={tal} />
      <Problemet marked="GB" />
      <Motoren marked="GB" funnelHref="/uk/start" />
      <RigtigeOpgaver marked="GB" funnelHref="/uk/start" />
      <OffentligeOpgaver marked="GB" funnelHref="/uk/start" />
      <Overgang marked="GB" funnelHref="/uk/start" />
      <IkkePortal marked="GB" />
      <SlutCta marked="GB" funnelHref="/uk/start" />
    </div>
  );
}
