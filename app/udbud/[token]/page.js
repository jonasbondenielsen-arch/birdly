import Deleside from "../../../components/Deleside";
import { fetchSharedNotice } from "../../../lib/share";

// Token-deleside (Fase D / D1). Privat link uden login — noindex. Token resolver til
// ét udbud + den kunde linket blev sendt til (via Edge Function get-shared-notice).
export const metadata = {
  title: "Dit udbud | Birdly",
  robots: { index: false, follow: false }, // privat token-side — aldrig i søgeresultater
};

export default async function Page({ params }) {
  const { token } = await params;
  const data = await fetchSharedNotice(token);
  return <Deleside token={token} data={data} />;
}
