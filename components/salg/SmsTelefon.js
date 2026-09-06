import { Fugl } from "./Ikoner";

// ============================================================================
// TELEFONEN MED BESKEDEN — produktet på ét blik.
//
// ⚠️ DET ER ET EKSEMPEL, OG DET SKAL STÅ PÅ SIDEN. Beskeden er en illustration af
// hvad en kunde modtager — den er IKKE hentet fra basen og er ikke en opgave der
// findes lige nu. Uden noten under telefonen kan en besøgende tro hun kigger på
// et live-match, og så er en illustration blevet til en påstand vi ikke kan holde.
//
// ⚠️ FORSKELLEN TIL FAG-BEVISET (sektion 6). Dér vises ÆGTE tal og ÆGTE titler
// fra basen, og dér er frist, beløb og køber udeladt med vilje — det er
// paywall-grænsen fra 30-07-2026. Her er alt opdigtet OG mærket som eksempel,
// og så må beskeden godt indeholde en frist: den viser hvad kunden FÅR, og en
// besked uden frist ville ikke vise produktet.
//
// ⚠️ INGEN BILLEDER, INTET LIBRARY. Ren CSS + inline SVG, fast højde i CSS'en, så
// der hverken hentes en fil eller sker layout-shift. Meta-trafik er mobil; det
// her er den tungeste ting over folden, og den vejer nul.
// ============================================================================
export default function SmsTelefon({
  titel = "Nyt opgavematch",
  fag = "Rengøring",
  sted = "Roskilde",
  hvad = "Fast rengøringsaftale",
  frist = "18. sept.",
  animer = true,
  note = "Eksempel på en besked. Sådan ser et match ud, når det lander.",
}) {
  return (
    <div>
      <div className="sg-telefon">
        <div className="sg-telefon-notch" aria-hidden="true" />
        <div className="sg-telefon-skaerm">
          <div className="sg-telefon-status" aria-hidden="true">
            <span>9.41</span>
            <span>•••• ⌃ ▮</span>
          </div>

          <div className={"sg-sms" + (animer ? " sg-anim" : "")}>
            <div className="sg-sms-hd">
              <span className="sg-sms-ic"><Fugl /></span>
              <span className="sg-sms-nm">BIRDLY</span>
              <span className="sg-sms-tm">nu</span>
            </div>
            <div className="sg-sms-t">{titel}</div>
            <div className="sg-sms-krop">
              <b>{fag}</b> · {sted}<br />
              {hvad}<br />
              Frist: {frist}<br />
              <span className="sg-sms-lnk">Se opgaven →</span>
            </div>
            <div className="sg-sms-stop">Svar STOP for at afmelde</div>
          </div>

          {/* Anden boble: kvitteringen for at man ikke skal gøre noget. Den
              kommer et halvt sekund efter den første, så øjet når at læse
              beskeden før forklaringen dukker op. */}
          <div className={"sg-sms" + (animer ? " sg-anim sg-anim-2" : "")} style={{ marginTop: 12, background: "#fff", borderColor: "var(--line)" }}>
            <div className="sg-sms-krop" style={{ color: "var(--navy-soft)" }}>
              Du skal ikke søge, logge ind eller holde øje.
              Vi sender den næste, når den kommer.
            </div>
          </div>
        </div>
      </div>
      {note && <p className="sg-telefon-note">{note}</p>}
    </div>
  );
}
