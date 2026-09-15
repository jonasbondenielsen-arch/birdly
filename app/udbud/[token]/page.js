import Deleside from "../../../components/Deleside";
import { fetchSharedNotice } from "../../../lib/share";

// Token-deleside (Fase D / D1). Privat link uden login — noindex. Token resolver til
// ét udbud + den kunde linket blev sendt til (via Edge Function get-shared-notice).
export const metadata = {
  title: "Dit udbud | Birdly",
  robots: { index: false, follow: false }, // privat token-side — aldrig i søgeresultater
};

// ?intern=<signatur>: support klikkede hertil fra kundens samleside. Åbningen tælles
// da ikke — se get-shared-notice + record_notice_open(p_intern) i migration 0045.
export default async function Page({ params, searchParams }) {
  const { token } = await params;
  const { intern = null } = (await searchParams) || {};
  const data = await fetchSharedNotice(token, intern);
  return <Deleside token={token} data={data} />;
}
