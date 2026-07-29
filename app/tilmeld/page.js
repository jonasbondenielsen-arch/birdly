import Tilmeld from "../../components/Tilmeld";
import { hentOpgaveTal } from "../../lib/opgaveTal";

export const metadata = {
  title: "Kom i gang med Birdly — opret din profil",
  description:
    "Opret din profil på to minutter, så finder Birdly de offentlige opgaver, der passer til dit fag og dit område. Gratis i 14 dage.",
};

export default async function Page({ searchParams }) {
  // Forudvælg fag fra ?fag= (sat af branchesidernes CTA, fx /tilmeld?fag=tomrer) og
  // region fra ?region= (sat af fag×geo-siderne). Kommer kunden fra "Entreprenør­opgaver
  // i Nordjylland", er begge dele valgt på forhånd — færre klik mellem interesse og
  // tilmelding. Ugyldige værdier ignoreres i komponenten, så en manipuleret URL ikke
  // kan sætte noget der ikke findes i kataloget.
  const sp = await searchParams;
  return <Tilmeld initialFag={sp?.fag || null} initialRegion={sp?.region || null} opgaveTal={await hentOpgaveTal()} />;
}
