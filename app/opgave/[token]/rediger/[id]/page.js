import RedigerOpgave from "../../../../../components/RedigerOpgave";

// ⚠️ NOINDEX. Token-side som resten af opretter-fladen.
export const metadata = {
  title: "Ret din opgave | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token, id } = await params;
  return <RedigerOpgave listToken={token} opgaveId={id} />;
}
