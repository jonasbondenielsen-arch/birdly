import Tilmeld from "../../components/Tilmeld";

export const metadata = {
  title: "Kom i gang med Birdly — opret din profil",
  description:
    "Opret din profil på to minutter, så finder Birdly de offentlige opgaver, der passer til dit fag og dit område. Gratis i 14 dage.",
};

export default async function Page({ searchParams }) {
  // Forudvælg fag fra ?fag= (sat af branchesidernes CTA, fx /tilmeld?fag=tomrer).
  const sp = await searchParams;
  return <Tilmeld initialFag={sp?.fag || null} />;
}
