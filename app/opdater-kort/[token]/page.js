import OpdaterKort from "../../../components/OpdaterKort";

// ⚠️ NOINDEX. Token-side — samme regel som /o/, /t/ og /mine-opgaver/.
// Her er den skarpere end normalt: siden fører til et betalingsvindue.
export const metadata = {
  title: "Opdatér betalingskort | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  return <OpdaterKort token={token} />;
}
