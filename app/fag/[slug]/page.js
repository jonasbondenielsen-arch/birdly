import { notFound } from "next/navigation";
import { BRANCHER, getBranche } from "../../../lib/branche";
import BrancheSide from "../../../components/BrancheSide";
import { abs } from "../../../lib/site";
import { hentOpgaveTal } from "../../../lib/opgaveTal";

// Statiske, server-renderede branchesider (én pr. fag) — indholdet er i HTML ved
// load, så Google kan crawle det.
export function generateStaticParams() {
  return BRANCHER.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = getBranche(slug);
  if (!b) return {};
  return {
    title: b.title,
    description: b.metaDescription,
    alternates: { canonical: "/fag/" + b.slug },
    openGraph: {
      title: b.title,
      description: b.metaDescription,
      type: "article",
      locale: "da_DK",
      siteName: "Birdly",
      url: abs("/fag/" + b.slug),
    },
    twitter: { card: "summary_large_image", title: b.title, description: b.metaDescription },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const b = getBranche(slug);
  if (!b) notFound();
  // Brødkrumme. Siderne havde allerede FAQPage-schema, men lå strukturelt løsrevet —
  // Google kunne ikke se at de hører under /brancher. Det er også den der giver
  // "Birdly › Brancher › VVS" i søgeresultatet frem for en bar URL.
  const brødkrumme = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Brancher", item: abs("/brancher") },
      { "@type": "ListItem", position: 3, name: b.label, item: abs("/fag/" + b.slug) },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brødkrumme) }} />
      <BrancheSide data={b} opgaveTal={await hentOpgaveTal()} />
    </>
  );
}
