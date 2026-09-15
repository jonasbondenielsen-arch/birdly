import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Privatlivspolitik — Birdly",
  description: "Sådan behandler Birdly personoplysninger, og dine rettigheder.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("privatlivspolitik")} />;
}
