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
export const metadata = {
  title: "Forhåndsvisning af betalingsside — Birdly",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutForhaandsvisning />;
}
