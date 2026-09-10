import { notFound } from "next/navigation";
import JuraSide from "../../../components/uk/JuraSide";
import { UK_JURA_SLUGS, juraSide, juraOverskrift } from "../../../lib/uk/jura";
import { baseUrl, MARKEDER } from "../../../lib/markets";

const GB = MARKEDER.GB;

// ============================================================================
// DE TI BRITISKE JURASIDER — ÉN RUTE, IKKE TI FILER.
//
// ⚠️ DE LIGGER UNDER /uk, OG DET ER DET DER GØR DEM GB-ONLY. Proxy'en
// rewriter en GB-vært til markedets `sti` ("uk"), så getbirdly.co.uk/terms
// bliver til /uk/terms internt. På birdly.dk findes ruten ikke — den danske
// juraside hedder /betingelser og er ikke rørt.
//
// ⚠️ EN DYNAMISK RUTE, IKKE TI page.js-FILER. De ti sider er den samme
// komponent med hver sin markdown; ti filer ville være ti steder at glemme
// noindex. `generateStaticParams` giver dem stadig hver sin statiske side.
//
// ⚠️ SEGMENTET HEDDER [jura] OG IKKE [slug]. Next foretrækker statiske
// segmenter, så /uk/start rammer stadig sin egen fil — men et generisk navn
// ville invitere til at bruge ruten til noget andet end jura.
// ============================================================================

// ⚠️ "terms" ER IKKE MED. Hub'en har sin egen rute (app/uk/terms) med
// DK's kort-layout; genererede vi den ogsaa her, ville to filer kappes om den
// samme adresse. Dokumenterne er de OEVRIGE ni.
// ⚠️ SKREVET UD SELV OM DET ER STANDARDVAERDIEN — den er en forudsaetning
// for den engelske fejlside, ikke en detalje. Er den false, 404'er routeren en
// ukendt slug FOER komponenten koerer; saa kaldes notFound() aldrig, og
// boundary'en i app/uk/[jura]/not-found.js faar aldrig ordet. Linjen goer den
// afhaengighed synlig for den der en dag vil praeg-generere ruten haardere.
//
// ⚠️ DEN VAR IKKE AARSAGEN TIL AT FEJLSIDEN IKKE VIRKEDE. Jagten 10-09-2026
// gik paa en foraeldet server: `next start` laeser .next ved opstart, og seks
// builds i traek blev maalt mod en proces der stadig svarede fra det gamle.
// Konklusionerne undervejs var derfor forkerte. Se scripts/start-server.mjs.
export const dynamicParams = true;

export function generateStaticParams() {
  return UK_JURA_SLUGS.filter((jura) => jura !== "terms").map((jura) => ({ jura }));
}

export async function generateMetadata({ params }) {
  const { jura } = await params;
  const side = juraSide(jura);
  if (!side) return {};
  return {
    title: `${juraOverskrift(side)} | Birdly`,
    alternates: { canonical: baseUrl("GB") + side.rute },
    // ⚠️ ALDRIG INDEKSERET SÅ LÆNGE DE ER DRAFT. Juraen gælder ikke rigtige
    // kunder endnu, og en indekseret betingelsesside ville se ud som om den
    // gjorde. Fjernes først når pre-live-tjeklisten er grøn.
    robots: GB.lanceret ? undefined : { index: false, follow: false },
  };
}

export default async function Side({ params }) {
  const { jura } = await params;
  const side = juraSide(jura);
  if (!side) notFound();
  return <JuraSide side={side} />;
}
