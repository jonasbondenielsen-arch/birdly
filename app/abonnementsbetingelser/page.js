import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Abonnementsbetingelser — Birdly",
  description: "Birdlys abonnementsbetingelser: pris, prøveperiode, fornyelse, betalingskort og opsigelse for måneds- og årsabonnement.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("abonnementsbetingelser")} />;
}
