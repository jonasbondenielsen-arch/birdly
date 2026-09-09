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

export function generateStaticParams() {
  return UK_JURA_SLUGS.map((jura) => ({ jura }));
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
