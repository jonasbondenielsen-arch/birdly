import OpretOpgave from "../../components/OpretOpgave";
import FooterB2C from "../../components/FooterB2C";

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
    "Beskriv din opgave på 60 sekunder. Birdly sender den videre til lokale virksomheder, der arbejder med din opgave. Gratis og uforpligtende.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <OpretOpgave />
      {/* ⚠️ B2C-FOOTER, ikke den almindelige. Se noten i FooterB2C.js — den
          normale linker til "Priser" med B2B-abonnementet på 499 kr./md. */}
      <FooterB2C />
    </>
  );
}
