import UdbudForAlle from "../../components/UdbudForAlle";
import { abs } from "../../lib/site";

// ⚠️ CANONICAL MANGLEDE HELT. Uden den afgoer Google selv hvilken variant der er
// den rigtige - inkl. varianter med trailing slash eller sporingsparametre - og
// siden kan ende med at konkurrere med sig selv. Alle oevrige offentlige sider
// har deres i orden; denne var den sidste uden.
//
// ⚠️ TITLEN SIGER NU BEGGE DELE. Siden handler ikke laengere kun om udbud:
// private opgaver er den lette indgang for de virksomheder der synes udbud er
// tunge, og det er hele sidens argument.
const TITLE = "Gode opgaver er ikke kun for de store — Birdly";
const BESKRIVELSE =
  "Birdly finder både offentlige og private opgaver til virksomheder i alle størrelser — automatisk, på SMS og mail. Du vælger selv, hvilke der passer til dig.";

export const metadata = {
  title: TITLE,
  description: BESKRIVELSE,
  alternates: { canonical: "/udbud-for-alle" },
  openGraph: {
    title: TITLE, description: BESKRIVELSE, type: "website",
    locale: "da_DK", siteName: "Birdly", url: abs("/udbud-for-alle"),
  },
};

export default function Page() {
  return <UdbudForAlle />;
}
