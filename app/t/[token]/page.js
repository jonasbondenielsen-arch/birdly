import TeaserLead from "../../../components/TeaserLead";

// ⚠️ NOINDEX. Token-sider må ALDRIG i søgeresultater — samme regel som /o/[token]
// og /mine-opgaver/[token]. Den gælder også her, selvom siden ikke viser
// kontaktoplysninger: den viser en privatpersons opgave.
export const metadata = {
  title: "Opgave til dig | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  return <TeaserLead token={token} />;
}
