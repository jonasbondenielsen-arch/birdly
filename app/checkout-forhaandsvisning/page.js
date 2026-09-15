import CheckoutForhaandsvisning from "../../components/CheckoutForhaandsvisning";

// ⚠️ NOINDEX + NOFOLLOW. Siden er en forhåndsvisning til gennemsyn hos vores
// indløser og må aldrig kunne findes af en kunde: den ligner betalingssiden, men
// kan intet, og en kunde der landede her ville tro at tilmeldingen var i stykker.
//
// ⚠️ IKKE I SITEMAP. app/sitemap.js bygger fra en EKSPLICIT liste (staticPaths +
// fag-sider), så en ny rute havner ikke i det ved et uheld — verificeret. Tilføj
// den aldrig dertil.
//
// ⚠️ IKKE LINKET FRA NOGET. Hverken nav, funnel, footer eller betingelses-oversigt.
// Adressen deles direkte af Jonas.
// ⚠️ TITLEN ER /start'S EGEN, ikke en beskrivelse af hvad siden er.
// Den stod før som "Forhåndsvisning af betalingsside — Birdly", og fanebladet er
// synligt på ethvert skærmbillede: så ville replikaen afsløre sig selv som noget
// andet end det den skal vise. Samme regel som resten af siden — ingen meta-tekst.
export const metadata = {
  title: "Kom i gang | Birdly",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutForhaandsvisning />;
}
