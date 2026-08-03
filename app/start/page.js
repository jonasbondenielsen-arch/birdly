import Start from "../../components/Start";

// /start — husets ENESTE tilmeldings-funnel (03-08-2026).
//
// ⚠️ DEN ER NU MÅLET FOR ALLE CTA'er. Jonas' gennemløb 03-08 gik hele vejen til
// betaling (sub-0067, webhooken ramte rigtigt), så forbeholdet om at /tilmeld var
// "den eneste beviste vej til betaling" er indfriet. /tilmeld omdirigerer hertil
// med query'en i behold — se next.config.mjs.
//
// ⚠️ INDEKSERBAR. Den stod `noindex` mens den kørte ved siden af /tilmeld; det var
// rigtigt dengang (to sider der begge er "tilmeld dig Birdly" ville konkurrere om
// samme søgeord). Nu hvor /tilmeld omdirigerer hertil, findes konkurrenten ikke
// længere, og siden SKAL kunne vises — ellers sender vi al trafik til en side
// Google ikke må vise.
//
// SEO-laget beholder "udbud" i title og description, jf. CLAUDE.md: vi vil ranke på
// både "udbud", "offentlige udbud" OG "offentlige opgaver". Den synlige tekst inde
// på siden siger "opgaver".
export const metadata = {
  title: "Kom i gang med Birdly — find offentlige udbud til dit fag",
  description:
    "Fortæl os hvad I laver, og hvor. Så holder vi øje med de offentlige udbud og opgaver, der passer til jer, og sender besked på SMS og mail. Gratis de første 14 dage.",
  alternates: { canonical: "/start" },
};

// ?fag=<key>      forvalgt fag fra en /fag/-side.
// ?region=<key>   forvalgt område fra en fag×geo-side (fx /fag/toemrer/nordjylland).
//                 Begge valideres mod kataloget i komponenten — en opdigtet værdi
//                 ignoreres stille frem for at sætte noget der ikke findes.
// ?betaling=ok    Reepays accept_url — kunden er tilbage fra den hostede checkout.
// ?betaling=annulleret  cancel_url — hun afbrød, intet er trukket.
export default async function Page({ searchParams }) {
  const { fag = null, region = null, betaling = null } = (await searchParams) || {};
  return <Start startFag={fag} startRegion={region} betaling={betaling} />;
}
