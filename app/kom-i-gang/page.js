import NyForside from "../../components/NyForside";
import { hentOpgaveTal } from "../../lib/opgaveTal";

// /kom-i-gang — SALGSSIDEN. Funnelens indgang og Meta-annoncernes landingsside.
//
//   annonce / husets CTA / de 36 /fag/-sider  →  DENNE side  →  /start  →  betaling
//
// ⚠️ ADRESSEN SKAL VÆRE STABIL. Den kommer til at stå i annoncer, og en annonce
// der peger på en død URL er spildte penge. Derfor ikke /ny: det navn betød
// "den nye" mens den kørte forsøgsvis ved siden af forsiden, og om et år ville
// ingen kunne se hvad det var. /kom-i-gang siger hvad siden gør — og matcher det
// sprog knapperne bruger.
//
// ⚠️ NOINDEX — OG DET ER EN BESLUTNING, IKKE EN FORGLEMMELSE.
// Siden sælger det SAMME til den SAMME søgende som forsiden, og dens fire
// FAQ-svar er ordret de samme strenge som fire af rodens tolv. Var begge
// indekserbare, ville vi selv sætte dem op mod hinanden på de søgeord roden
// lever af — og en anden title ville kun sløre det, ikke løse det.
//
// Den skal ikke rangere. Den skal konvertere betalt trafik. Annoncer har ingen
// glæde af et indeks.
//
// Vil vi senere have organisk trafik direkte på funnelen, kræver det at siden
// får sit EGET indhold og sit eget søgeord — ikke bare at flaget vendes.
export const metadata = {
  title: "Kom i gang med Birdly",
  description:
    "Fortæl os hvad I laver, og hvor. Så holder vi øje med de offentlige opgaver, der passer til jer, og sender besked på SMS.",
  robots: { index: false, follow: true },
};

// ?fag= / ?region= sættes af de 36 /fag/-siders CTA og føres videre til /start.
// Salgssiden validerer dem ikke — det gør /start mod kataloget, så der kun findes
// ÉT sted hvor de bliver troet på.
export default async function Page({ searchParams }) {
  const { fag = null, region = null } = (await searchParams) || {};
  const tal = await hentOpgaveTal();
  return <NyForside tal={tal} fag={fag} region={region} />;
}
