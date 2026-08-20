import OpretOpgave from "../../components/OpretOpgave";
import Footer from "../../components/Footer";

// ⚠️ NOINDEX INDTIL LAUNCH. Siden findes på sin adresse, så den kan vises frem og
// gennemses — men den må ikke kunne findes. En offentlig "opret opgave"-side flytter
// Birdly fra ren B2B-udbudstjeneste mod et marketplace-element, og den positionering
// skal være besluttet før Google indekserer den. Fjern robots-blokken når Clearhaus er
// i hus OG Jonas har givet go til at gøre siden synlig.
//
// Knappen i navigationen er spærret separat (NEXT_PUBLIC_OPRET_OPGAVE) — se
// lib/opretOpgave.js. De to skal tændes hver for sig, så siden kan være åben for
// besøgende uden at være i søgeresultater, eller omvendt.
export const metadata = {
  title: "Opret opgave — få lokale virksomheder til at kontakte dig | Birdly",
  description:
    "Beskriv din opgave på 60 sekunder. Birdly sender den videre til relevante lokale virksomheder, der kan hjælpe dig. Gratis og uforpligtende.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <OpretOpgave />
      <Footer />
    </>
  );
}
