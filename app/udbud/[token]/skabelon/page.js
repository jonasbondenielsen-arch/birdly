import Skabelon from "../../../../components/Skabelon";
import { fetchSharedNotice } from "../../../../lib/share";

// Bud-skabelon (Fase D / S1). Privat token-side uden login — noindex. Samme token-
// resolve som delesiden (Edge Function get-shared-notice, scoped til én match).
export const metadata = {
  title: "Din tilbuds-skabelon | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  const data = await fetchSharedNotice(token);
  return <Skabelon token={token} data={data} />;
}
