import Link from "next/link";
import { OPRET_OPGAVE_I_NAV } from "../lib/opretOpgave";

// "Opret opgave"-knappen i markedsførings-navigationen. ÉN kilde, fordi den skal stå
// fire steder (forside, branchesider, /brancher, /udbud-for-alle) og flaget ellers
// ville skulle huskes fire gange — og et glemt flag ét sted er nok til at siden er
// synlig før den må være det.
//
// ⚠️ IKKE på /kom-i-gang. Salgssiden holdes fokuseret på tilmelding og har sit eget
// CSS-system (salg.css, .sg-navcta-2) — en knap dertil ville hverken arve stilen eller
// tjene siden.
//
// Returnerer null når flaget er slukket, så headeren er bit for bit uændret indtil
// Clearhaus er i hus og Jonas tænder den.
export default function OpretOpgaveCta({ className = "nav-cta" }) {
  if (!OPRET_OPGAVE_I_NAV) return null;
  return (
    <Link href="/opret-opgave" className={className}>
      Opret opgave
    </Link>
  );
}
