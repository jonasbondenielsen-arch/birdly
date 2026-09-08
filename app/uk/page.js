import { Hero, BevisBjaelke } from "../../components/salg/Sektioner";
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
  // ⚠️ TALLENE HENTES FOR GB, OG VERIFICERES. Er GB-domænerne slukkede (som nu),
  // svarer Edge Function'en DK, `hentOpgaveTal` opdager uenigheden og returnerer
  // null — og bevis-bjælken renderer sig selv væk frem for at vise danske tal
  // på en britisk side. Copy-filen §4: "hide the numbers rather than showing
  // Danish numbers."
  const tal = await hentOpgaveTal("GB", baseUrl("GB"));

  return (
    <div className="sg" lang="en-GB">
      <Hero marked="GB" funnelHref="/uk/start" />
      <BevisBjaelke marked="GB" tal={tal} />
    </div>
  );
}
