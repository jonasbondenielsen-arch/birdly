import Fornyt from "../../../components/Fornyt";

// ⚠️ NOINDEX. Token-sider maa ALDRIG i soegeresultater - samme regel som
// /mine-opgaver/[token] og /o/[token].
export const metadata = {
  title: "Forny dit abonnement | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  return <Fornyt token={token} />;
}
