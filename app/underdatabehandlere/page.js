import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

export const metadata = {
  title: "Underdatabehandlere — Birdly",
  description: "Liste over de leverandører, der behandler data på vegne af Birdly.",
};

export default function Page() {
  return <LegalDoc markdown={readLegal("underdatabehandlere")} />;
}
