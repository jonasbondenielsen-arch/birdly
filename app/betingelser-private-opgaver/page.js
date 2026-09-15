import LegalDoc from "../../components/LegalDoc";
import { readLegal } from "../../lib/legal";

// ⚠️ TEKSTEN ER ET UDKAST og bærer selv den advarsel øverst i dokumentet. Den er
// gengivet ORDRET fra Jonas' udkast — ordlyden er juridisk indhold, ikke copy vi må
// stramme op. Ret kun i content/legal/betingelser-private-opgaver.md, og først når
// Jonas og advokaten har godkendt.
//
// ⚠️ NOINDEX INDTIL GODKENDT. De øvrige betingelses-sider er indekserbare, men et
// juridisk UDKAST må ikke kunne findes i søgeresultater og læses som gældende.
// Fjern robots-blokken samtidig med at UDKAST-mærket fjernes fra markdown-filen —
// de to hører sammen.
export const metadata = {
  title: "Betingelser for oprettelse af private opgaver — Birdly",
  description:
    "Betingelser for privatpersoner, der opretter en opgave på Birdly: formidling, gratis oprettelse, fordeling til op til tre virksomheder, ansvar og persondata.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LegalDoc markdown={readLegal("betingelser-private-opgaver")} />;
}
