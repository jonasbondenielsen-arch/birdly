import PrivatLead from "../../../components/PrivatLead";

// ⚠️ NOINDEX. Token-sider må ALDRIG i søgeresultater — samme regel som
// /mine-opgaver/[token] og /udbud/[token]. Her er den skarpere end normalt: siden
// fører til en privatpersons telefonnummer, når virksomheden har taget en plads.
export const metadata = {
  title: "Privat opgave | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  return <PrivatLead token={token} />;
}
