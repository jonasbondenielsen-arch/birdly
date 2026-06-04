import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Cookiepolitik — Birdly",
  description: "Hvilke cookies Birdly bruger, og hvordan du styrer dit samtykke.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("cookiepolitik")} />;
}
