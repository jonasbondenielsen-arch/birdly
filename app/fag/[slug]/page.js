import { notFound } from "next/navigation";
import { BRANCHER, getBranche } from "../../../lib/branche";
import BrancheSide from "../../../components/BrancheSide";

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
      url: "https://birdly.dk/fag/" + b.slug,
    },
    twitter: { card: "summary_large_image", title: b.title, description: b.metaDescription },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const b = getBranche(slug);
  if (!b) notFound();
  return <BrancheSide data={b} />;
}
