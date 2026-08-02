import NyForside from "../../components/NyForside";
import { hentOpgaveTal } from "../../lib/opgaveTal";

// /ny — resultat-først forside.
//
// ⚠️ ERSTATTER IKKE `/`. Forsiden bærer hele SEO-laget, sitemap og alle indgående
// links. Den her kører ved siden af, så de to kan sammenlignes; virker den bedre,
// flyttes indholdet ind på `/` og denne rute fjernes.
//
// ⚠️ NOINDEX indtil da. To indekserede sider der begge er "Birdly finder offentlige
// opgaver til dig" ville konkurrere med hinanden og udvande forsiden — præcis den
// fælde SEO-laget er bygget for at undgå.
export const metadata = {
  title: "Kom i gang | Birdly",
  description: "Vi holder øje med alle offentlige opgaver i Danmark og giver dig besked på SMS, når en passer til dit fag.",
  robots: { index: false, follow: false },
};

// Tallene hentes server-side, så de står i HTML'en ved load — ingen blinkende
// tom boks. Fejler kaldet, returnerer hentOpgaveTal null, og live-boksen
// renderer slet ikke; resten af siden står fint uden.
export default async function Page() {
  const tal = await hentOpgaveTal();
  return <NyForside tal={tal} />;
}
