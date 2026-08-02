import Start from "../../components/Start";

// /start — den korte onboarding (fire skærme).
//
// ⚠️ KØRER VED SIDEN AF /tilmeld, erstatter den ikke. Den gamle funnel bærer alle
// 14 SEO-links og er den eneste beviste vej til betaling; CTA'erne flyttes først
// når denne har vist sig bedre.
//
// ⚠️ NOINDEX indtil den er bevist. To indekserede sider der begge er "tilmeld dig
// Birdly" ville konkurrere med hinanden i søgeresultatet og udvande /tilmeld, som
// SEO-laget peger på. Fjernes bevidst når den overtager.
export const metadata = {
  title: "Kom i gang | Birdly",
  description: "Fortæl os hvad I laver, og hvor. Så holder vi øje med de offentlige opgaver for jer.",
  robots: { index: false, follow: false },
};

// ?fag=<key> lader et fag-kort på forsiden starte flowet med faget valgt — så er
// kundens første valg allerede truffet når hun lander her.
export default async function Page({ searchParams }) {
  const { fag = null } = (await searchParams) || {};
  return <Start startFag={fag} />;
}
