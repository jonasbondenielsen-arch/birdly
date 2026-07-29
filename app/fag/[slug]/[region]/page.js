import { notFound } from "next/navigation";
import { getBranche } from "../../../../lib/branche";
import { getRegion, alleFagGeo } from "../../../../lib/regioner";
import BrancheSide from "../../../../components/BrancheSide";
import { abs } from "../../../../lib/site";
import { hentOpgaveTal, antalForFagGeo } from "../../../../lib/opgaveTal";

// Fag×geo-sider. SAMME komponent som /fag/[slug] — kun med en region-dimension.
// Ruterne er begrænset til de 16 kombinationer i lib/regioner.js, hvor målingen viste
// varigt indhold. Alt andet giver 404 frem for en tom side: en side uden opgaver er
// thin content, og thin content trækker hele domænet ned, ikke bare sig selv.
export function generateStaticParams() {
  return alleFagGeo().map(({ fag, region }) => ({ slug: fag, region }));
}

// dynamicParams=false: kun de 16 findes. Uden den ville /fag/maler/nordjylland blive
// server-renderet på forespørgsel og udstille præcis den tomme side vi undgår.
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug, region: regionSlug } = await params;
  const b = getBranche(slug);
  const r = getRegion(regionSlug);
  if (!b || !r) return {};

  // ⚠️ DET DOBBELTE SPOR. Synlig tekst siger "opgaver" (brandsproget), mens title og
  // description bærer "udbud" — det er dét folk faktisk googler. Begge dele er sande;
  // de rammer bare hver sin læser.
  const title = `Offentlige udbud og opgaver for ${b.nounPlural} ${r.praep} ${r.navn} | Birdly`;
  const description = `Få besked på SMS når der er en offentlig opgave for ${b.nounPlural} ${r.praep} ${r.navn}. Birdly holder øje med kommunernes udbud — gratis i 14 dage.`;
  const sti = `/fag/${b.slug}/${r.slug}`;

  return {
    title,
    description,
    alternates: { canonical: sti },
    openGraph: { title, description, type: "article", locale: "da_DK", siteName: "Birdly", url: abs(sti) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }) {
  const { slug, region: regionSlug } = await params;
  const b = getBranche(slug);
  const r = getRegion(regionSlug);
  if (!b || !r) notFound();

  const brødkrumme = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Brancher", item: abs("/brancher") },
      { "@type": "ListItem", position: 3, name: b.label, item: abs("/fag/" + b.slug) },
      { "@type": "ListItem", position: 4, name: r.navn, item: abs(`/fag/${b.slug}/${r.slug}`) },
    ],
  };

  const opgaveTal = await hentOpgaveTal();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brødkrumme) }} />
      <BrancheSide data={b} region={r} opgaveTal={opgaveTal} antal={antalForFagGeo(opgaveTal, b.fagKey, r.slug)} />
    </>
  );
}
