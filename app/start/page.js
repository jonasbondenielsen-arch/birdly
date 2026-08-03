import Start from "../../components/Start";

// /start — husets ENESTE tilmeldings-funnel (03-08-2026).
//
// ⚠️ ANDET LAG, IKKE INDGANGEN. Kunden kommer hertil fra SALGSSIDEN på roden, som
// er den eneste side husets knapper og annoncerne peger på. Peg aldrig en
// hjemmeside-CTA direkte herind: så bliver hun bedt om sit CVR uden at have set
// hvad hun køber. /tilmeld omdirigerer til roden, ikke hertil — se next.config.mjs.
//
// Jonas' gennemløb 03-08 gik hele vejen til betaling (sub-0067, webhooken ramte
// rigtigt), så forbeholdet om at /tilmeld var "den eneste beviste vej til betaling"
// er indfriet.
//
// ⚠️ NOINDEX — OG DET ER MED VILJE. Siden var kortvarigt indekserbar, mens den var
// tænkt som husets indgang. Den er den ikke: indgangen er SALGSSIDEN på roden, og
// /start er flowet BAG CTA'en. Et CVR-felt er ikke en landingsside — rankede den,
// ville Google sende folk direkte ind i trin 1 og forbi hele salgsarbejdet.
//
// Der er derfor heller ingen canonical og ingen plads i sitemap: roden er den
// kanoniske indgang, og to indekserede sider om "tilmeld dig Birdly" ville
// konkurrere om samme søgeord.
export const metadata = {
  title: "Kom i gang | Birdly",
  description:
    "Fortæl os hvad I laver, og hvor. Så holder vi øje med de offentlige opgaver, der passer til jer.",
  robots: { index: false, follow: false },
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
