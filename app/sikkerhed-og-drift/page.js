import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Sikkerhed og drift — Birdly",
  description: "Hvordan Birdly beskytter data: EU-hosting, kryptering og adgangsstyring.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("sikkerhed-og-drift")} />;
}
