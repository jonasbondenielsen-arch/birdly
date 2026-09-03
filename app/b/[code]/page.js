import KortloesBetal from "../../../components/KortloesBetal";

// /b/{list_short_code} — betalingslink for KORTLØSE kunder (05-08-2026).
//
// ⚠️ GENÅBNET 03-09-2026. Ruten var spærret siden 13-08, fordi
// create-subscription-session dengang kørte mod Frisbiis TEST-miljø: en rigtig
// kunde ville enten få kortet afvist eller — værre — gennemføre en testbetaling
// og blive flippet til status='aktiv' uden at der var flyttet en krone.
//
// Begge årsager er væk: live-nøgle, live-webhook og live plan-handles er sat, og
// kæden er bevist ende til ende (sub-0007 og sub-0009 aktiverede med kort gemt).
//
// ⚠️ DER TRÆKKES IKKE PENGE NÅR HUN GENNEMFØRER. create-subscription-session
// sætter no_trial=true SAMMEN MED start_date = kundens egen trial_ends_at, så
// første faktura planlægges til den dato hun allerede havde. Ingen ny prøve,
// ingen forlængelse, intet træk nu. Fjernes start_date dér, begynder denne side
// at trække penge med det samme — og migrations-mailen lover det modsatte.
//
// ⚠️ SAMME CHECKOUT SOM /start. KortloesBetal bruger WindowSubscription (redirect).
// Den indlejrede variant blev prøvet live 03-09 og oprettede abonnementer UDEN
// kort; den må ikke genindføres her uden at være bevist i test-mode først.
//
// ⚠️ NOINDEX. Adressen er en kundes personlige link, præcis som /mine-opgaver/
// og /udbud/. Den må aldrig i et søgeresultat.
export const metadata = {
  title: "Fortsæt med Birdly",
  description: "Tilføj betaling og fortsæt med at få opgaver, der passer til jer.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { code } = await params;
  return <KortloesBetal code={code} />;
}
