import MineOpgaver from "../../../components/MineOpgaver";
import { fetchMyTasks } from "../../../lib/share";

// Samlesiden "Mine opgaver" (Spor 3b). Privat link uden login — noindex. Kundens
// list_token resolver til ALLE hendes aktive opgaver (via Edge Function get-my-tasks).
// Linket er LEVENDE: samle-SMS'en peger altid herhen, og siden viser tilstanden nu —
// ikke et øjebliksbillede fra dengang beskeden blev sendt.
export const metadata = {
  title: "Mine opgaver | Birdly",
  robots: { index: false, follow: false }, // privat token-side — aldrig i søgeresultater
};

// ?intern=<signatur> er admins support-visning (birdly-admin/lib/internMarkoer.js).
// Den videresendes ordret; Edge Function'en afgør om den er ægte og springer i så fald
// AL sporing over. En kunde kan ikke gætte den, og uden den er alt som før.
export default async function Page({ params, searchParams }) {
  const { token } = await params;
  const { intern = null } = (await searchParams) || {};
  const data = await fetchMyTasks(token, intern);
  return <MineOpgaver token={token} data={data} intern={intern} />;
}
