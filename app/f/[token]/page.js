import FakturaSide from "../../../components/FakturaSide";

// ⚠️ NOINDEX, NOFOLLOW. En faktura er et privat dokument. Token-siderne bærer
// alle det samme værn — se noten i app/robots.js om hvorfor det er noindex og
// ikke Disallow: en spærret side kan Google ikke LÆSE vores noindex på.
export const metadata = {
  title: "Din faktura | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  return <FakturaSide token={token} />;
}
