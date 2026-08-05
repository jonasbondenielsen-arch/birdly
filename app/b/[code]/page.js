import KortloesBetal from "../../../components/KortloesBetal";

// /b/{list_short_code} — betalingslink for KORTLØSE kunder (05-08-2026).
//
// ⚠️ NOINDEX. Adressen er en kundes personlige link, præcis som /mine-opgaver/
// og /udbud/. Den må aldrig i et søgeresultat.
export const metadata = {
  title: "Fortsæt med Birdly",
  description: "Tilføj betaling og fortsæt med at få opgaver, der passer til jer.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { code } = await params;
  return <KortloesBetal code={code} />;
}
