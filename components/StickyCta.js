import Link from "next/link";

// ============================================================================
// STICKY CTA — slank bjælke i bunden, synlig hele vejen ned.
//
// ⚠️ KOLLISIONER. To andre ting bor i bunden af skærmen:
//   · samtykke-banneret (z-index 90, kun til der er taget stilling)
//   · forsidens chat-knap (z-index 200) — findes IKKE på branchesiderne, så den
//     kan ikke ramme os her, men det er værd at vide hvis bjælken senere flyttes
//     til forsiden.
// Bjælken ligger derfor på z-index 80 og løftes op over samtykke-banneret med den
// højde banneret selv melder ud som --samtykke-h. Samme mekanik som da chat-knappen
// dækkede "Accepter alle" — vi gætter ikke på højden, vi bruger den målte.
//
// Server-komponent: den er ren markup uden tilstand, så den koster ingen JavaScript.
// ============================================================================
export default function StickyCta({ href, tekst, knap = "Kom i gang gratis" }) {
  return (
    <div className="sticky-cta">
      <div className="sticky-cta-inner">
        <p>{tekst}</p>
        <Link href={href} className="btn btn-teal">{knap}</Link>
      </div>
    </div>
  );
}
