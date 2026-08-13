import FeedbackKort3 from "../../../components/FeedbackKort3";
import { hentKort3Status } from "../../../lib/feedback";

// Det korte feedback-skema (3 spørgsmål). Nås via kortlinket /fb/{kode}.
// Adgang = kundens eget list_token i URL'en — ingen ny token-model.
//
// ⚠️ NOINDEX. Token-side — må ALDRIG i søgeresultater, samme regel som
// /mine-opgaver/[token], /udbud/[token] og /forlaeng/[token].
//
// ⚠️ IKKE I MENUEN. Siden er usynlig og nås kun via linket i en besked til kunden.
export const metadata = {
  title: "Din anmeldelse | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { token } = await params;
  // Tilstanden hentes server-side, så siden ved fra første render om kunden er på
  // prøve eller betalende, og om hun allerede har svaret — hun skal ikke se et skema
  // blinke frem og så forsvinde.
  const start = await hentKort3Status(token);
  return <FeedbackKort3 token={token} start={start} />;
}
