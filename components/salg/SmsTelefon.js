import { Fugl } from "./Ikoner";
import { tekster } from "../../lib/tekster";

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
// ⚠️ TELEFONEN VAR HELT DANSK PÅ DEN BRITISKE FORSIDE (fundet 09-09-2026).
// Den står MIDT I HERO'EN, så en britisk besøgende læste "Nyt opgavematch ·
// Rengøring · Roskilde · Frist: 18. sept." lige under et engelsk løfte. Det er
// præcis den fejl lib/tekster/index.js advarer om — bare værre, for her faldt
// intet tilbage: komponenten var aldrig koblet til ordbogen, så der var ingen
// manglende nøgle at opdage. Copy-filen §4 "PHONE MOCK-UP" havde teksten hele
// tiden.
//
// ⚠️ HVER STRENG ER STADIG EN PROP FØRST. SmsDemo sender sine egne værdier ind
// (fag, sted, hvad pr. kunde-fag), og de skal blive ved med at vinde over
// ordbogen. Ordbogen er defaulten, ikke en overstyring.
export default function SmsTelefon({
  titel,
  fag,
  sted,
  hvad,
  frist,
  animer = true,
  note,
  marked = "DK",
}) {
  const T = tekster(marked).telefon;
  titel = titel ?? T.titel;
  fag = fag ?? T.fag;
  sted = sted ?? T.sted;
  hvad = hvad ?? T.hvad;
  frist = frist ?? T.frist;
  // ⚠️ `undefined` OG `null` ER IKKE DET SAMME HER. Ingen kalder gør det i dag,
  // men `note={null}` er den måde man skjuler noten på — og et `??` ville have
  // sat husets note tilbage og gjort skjul umuligt.
  note = note === undefined ? T.note : note;
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
              <span className="sg-sms-tm">{T.nu}</span>
            </div>
            <div className="sg-sms-t">{titel}</div>
            <div className="sg-sms-krop">
              <b>{fag}</b> · {sted}<br />
              {hvad}<br />
              {T.fristLabel}{frist}<br />
              <span className="sg-sms-lnk">{T.link}</span>
            </div>
            <div className="sg-sms-stop">{T.stop}</div>
          </div>

          {/* Anden boble: kvitteringen for at man ikke skal gøre noget. Den
              kommer et halvt sekund efter den første, så øjet når at læse
              beskeden før forklaringen dukker op. */}
          <div className={"sg-sms" + (animer ? " sg-anim sg-anim-2" : "")} style={{ marginTop: 12, background: "#fff", borderColor: "var(--line)" }}>
            <div className="sg-sms-krop" style={{ color: "var(--navy-soft)" }}>
              {T.kvittering}
            </div>
          </div>
        </div>
      </div>
      {note && <p className="sg-telefon-note">{note}</p>}
    </div>
  );
}
