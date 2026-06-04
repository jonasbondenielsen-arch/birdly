import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Vilkår for brug af birdly.dk — Birdly",
  description: "Vilkår for brug af birdly.dk.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("vilkaar-for-brug")} />;
}
