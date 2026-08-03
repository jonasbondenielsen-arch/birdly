import Start from "../../components/Start";

// /start — den korte onboarding (fem skærme).
//
// ⚠️ KØRER VED SIDEN AF /tilmeld, erstatter den ikke. Den gamle funnel bærer alle
// 14 SEO-links og er den eneste beviste vej til betaling; CTA'erne flyttes først
// når denne har vist sig bedre.
//
// ⚠️ NOINDEX indtil den er bevist. To indekserede sider der begge er "tilmeld dig
// Birdly" ville konkurrere med hinanden i søgeresultatet og udvande /tilmeld.
export const metadata = {
  title: "Kom i gang | Birdly",
  description: "Fortæl os hvad I laver, og hvor. Så holder vi øje med de offentlige opgaver for jer.",
  robots: { index: false, follow: false },
};

// ?fag=<key>      lader et fag-kort på forsiden starte flowet med faget valgt.
// ?betaling=ok    Reepays accept_url — kunden er tilbage fra den hostede checkout.
// ?betaling=annulleret  cancel_url — hun afbrød, intet er trukket.
export default async function Page({ searchParams }) {
  const { fag = null, betaling = null } = (await searchParams) || {};
  return <Start startFag={fag} betaling={betaling} />;
}
