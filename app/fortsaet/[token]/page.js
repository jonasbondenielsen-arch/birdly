import Fortsaet from "../../../components/Fortsaet";
import { hentFortsaet } from "../../../lib/fortsaet";

// "Behold din overvågning" — kundens tilbagemelding ved prøveudløb.
// Nås kun via SMS-linket /fortsaet/{fortsaet_token}.
//
// ⚠️ NOINDEX. Token-side — må ALDRIG i søgeresultater, samme regel som
// /mine-opgaver/[token], /feedback/[token] og /o/[token].
//
// ⚠️ IKKE I MENUEN. Siden er usynlig og nås kun via linket i beskeden til kunden.
//
// ⚠️ LIGGER I birdly, IKKE I birdly-admin. Det er en KUNDE-side; bag admin-login
// kunne kunden ikke åbne den. Data, edge function og adminvisninger hører til i
// birdly-admin — det er kun selve siden der bor her.
export const metadata = {
  title: "Behold din overvågning | Birdly",
  robots: { index: false, follow: false },
};

// ⚠️ ALDRIG CACHET. Siden viser hvor mange dage der er til udløb og om der allerede
// er svaret. En cachet udgave ville kunne vise "udløber om 3 dage" en uge efter, og
// — værre — vise valg-skærmen til en kunde der lige har sagt nej.
export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { token } = await params;
  // Tilstanden hentes server-side, så kunden aldrig ser valg-skærmen blinke frem og
  // blive erstattet af en kvittering. Samme greb som /feedback/[token].
  //
  // ⚠️ SIDE-EFFEKT: dette kald logger `side_aabnet` — men kun første gang pr.
  // slutdato, så et genindlæst faneblad eller en link-preview i beskedappen ikke
  // tæller som en ny åbning.
  const start = await hentFortsaet(token);
  return <Fortsaet token={token} start={start} />;
}
