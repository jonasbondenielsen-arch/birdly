import MinOpgaveListe from "../../../components/MinOpgaveListe";

// ⚠️ NOINDEX. Token-side — samme regel som alle andre. Denne bærer opretterens egne
// opgaver, og linket udløber 24 timer efter hendes sidste opgave er lukket.
export const metadata = {
  title: "Dine opgaver | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  return <MinOpgaveListe token={token} />;
}
