import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Handelsbetingelser — Birdly",
  description: "Birdlys handelsbetingelser: abonnement, prøveperiode, betaling og opsigelse.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("handelsbetingelser")} />;
}
