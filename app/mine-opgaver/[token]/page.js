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

export default async function Page({ params }) {
  const { token } = await params;
  const data = await fetchMyTasks(token);
  return <MineOpgaver token={token} data={data} />;
}
