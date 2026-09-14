import Link from "next/link";
import { Logo } from "./Logo";

// Udløbet-tilstand for den OFFENTLIGE "dagens udbud"-side (/dagens-udbud/[id]).
// Vises når udbuddets frist er overskredet (eller id'et ikke kan findes). Samme
// Birdly-layout som den aktive side — pæn forsmag der konverterer til tilmelding,
// så gamle SoMe-links stadig giver et godt indtryk. Aldrig udbuds-detaljer her.

const WRAP = { maxWidth: 760, margin: "0 auto", padding: "24px 18px 64px" };
const CARD = { background: "#fff", border: "1px solid #E6EAEF", borderRadius: 16, padding: "26px 28px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" };

export default function DagensUdbudUdloebet() {
  return (
    <main style={{ ...WRAP, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 28px" }}><Logo /></div>
      <div style={CARD}>
        <h1 style={{ fontSize: 24, lineHeight: 1.3, margin: "4px 0 14px" }}>Denne opgave er ikke længere aktiv 🕊️</h1>
        <p style={{ color: "#41505E", lineHeight: 1.7, fontSize: 16, margin: "0 0 14px" }}>
          Fristen for at byde på denne opgave er overskredet, så vi kan ikke længere vise det her.
        </p>
        <p style={{ color: "#41505E", lineHeight: 1.7, fontSize: 16, margin: "0 0 24px" }}>
          Men sådan går det ikke næste gang: med Birdly får du besked om nye opgaver i dit fag, så snart de
          offentliggøres — direkte på SMS og mail, mens der stadig er god tid til at byde.
        </p>
        <Link href="/start" style={{ display: "inline-block", background: "#1E9E8A", color: "#fff", fontWeight: 700, borderRadius: 12, padding: "14px 24px", textDecoration: "none", fontSize: 16 }}>
          👉 Prøv Birdly gratis — så misser du aldrig en opgave igen →
        </Link>
        {/* ⚠️ ADRESSEN SKREVET UD, FORDI SIDEN OGSÅ LÆSES SOM DELT BILLEDE/SKÆRMBILLEDE.
            Her stod "birdly.dk/tilmeld" — en adresse der har 308'et til /kom-i-gang
            siden 03-08-2026, på apex-værten, altså to hop for den der tastede den af.
            Nu står den vi faktisk vil have folk til at taste. */}
        <p style={{ marginTop: 16 }}>
          <Link href="https://www.birdly.dk/start" style={{ color: "#1E9E8A", fontWeight: 600 }}>birdly.dk/start</Link>
        </p>
      </div>
    </main>
  );
}
