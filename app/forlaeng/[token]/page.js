import Forlaeng from "../../../components/Forlaeng";
import { hentForlaengStatus } from "../../../lib/feedback";

// Feedback-skemaet der giver 7 ekstra prøvedage. Nås fra velkomstmailens knap og fra
// SMS'en efter 5 hverdage. Adgang = kundens eget list_token i URL'en.
//
// ⚠️ NOINDEX. Token-side — må ALDRIG i søgeresultater, samme regel som
// /mine-opgaver/[token] og /udbud/[token].
export const metadata = {
  title: "Forlæng din prøveperiode | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  // Tilstanden hentes server-side, så siden ved fra første render om tilbuddet er
  // aktivt — kunden skal ikke se et skema blinke frem og så forsvinde.
  const start = await hentForlaengStatus(token);
  return <Forlaeng token={token} start={start} />;
}
