"use client";

import { useState } from "react";
import { sendOpgaveFeedback } from "../lib/privatOpgave";

// ============================================================================
// FEEDBACK-SKEMA efter "Opgaven er løst" — bundark på mobil, kort på desktop.
//
// ⚠️ ET ARK, IKKE EN NY SIDE. Hun har lige trykket "Opgaven er løst" og er færdig.
// Sendte vi hende videre til /feedback/[token], ville hun opleve det som et nyt
// skridt hun ikke bad om — og de fleste ville lukke fanen. Arket ligger oven på den
// side hun allerede står på, og kan lukkes med ét klik.
//
// ⚠️ OPGAVEN ER ALLEREDE LUKKET NÅR DET HER VISES. Skemaet er et efterspørgsmål,
// ikke et trin i lukningen. Lukker hun uden at svare, sker der præcis det samme med
// opgaven. Derfor er der ingen "er du sikker?" og intet påkrævet felt.
//
// ⚠️ "FANDT DU VIRKSOMHEDEN GENNEM BIRDLY?" ER DET VIGTIGSTE SPØRGSMÅL PÅ SIDEN,
// og derfor det første. Et match der blev til en accept er ikke det samme som en
// opgave vi løste — hun kan have fået fat i sin svoger undervejs. Uden det svar
// måler funnelen accepter i stedet for resultater.
//
// ⚠️ VINDER-SPØRGSMÅLET VISES KUN VED "JA". Ved "Nej" findes der ingen vinder at
// pege på, og at spørge alligevel ville presse hende til at udpege en virksomhed
// der ikke lavede arbejdet. Serveren håndhæver det samme.
//
// ⚠️ SAMTYKKET ER SLUKKET FRA START og skal aktivt sættes. Det er tilladelsen til
// at citere hende med navn — den må aldrig være forvalgt.
// ============================================================================

const NEMHED = [
  ["meget_nemt", "Meget nemt"],
  ["nemt", "Nemt"],
  ["okay", "Okay"],
  ["svaert", "Svært"],
];

export default function OpgaveFeedback({ token, opgave, onLuk }) {
  const [viaBirdly, setViaBirdly] = useState(null);
  const [vinder, setVinder] = useState(null);
  const [stjerner, setStjerner] = useState(0);
  const [nemhed, setNemhed] = useState("");
  const [fritekst, setFritekst] = useState("");
  const [mkOk, setMkOk] = useState(false);
  const [travl, setTravl] = useState(false);
  const [tak, setTak] = useState(false);

  const virksomheder = opgave.virksomheder || [];

  async function send() {
    setTravl(true);
    try {
      await sendOpgaveFeedback(token, opgave.id, {
        via_birdly: viaBirdly,
        vinder_plads: viaBirdly === true ? vinder : null,
        stjerner: stjerner || null,
        nemhed: nemhed || null,
        fritekst,
        markedsfoering_ok: mkOk,
      });
    } catch {
      // ⚠️ FEJLER DET, SIGER VI STADIG TAK. Opgaven ER lukket; feedbacken er en
      // gave. At vise hende en fejlbesked for noget hun gjorde frivilligt — og
      // ikke kan gøre noget ved — ville straffe hende for at hjælpe os.
    }
    setTravl(false);
    setTak(true);
  }

  if (tak) {
    return (
      <div className="of-ark" role="dialog" aria-label="Tak for din feedback">
        <div className="of-kort of-tak">
          <div className="of-emoji" aria-hidden="true">💙</div>
          <h2>Tak for din feedback</h2>
          <p>Din opgave er nu afsluttet.</p>
          <button className="pl-mini primaer" onClick={onLuk}>Luk</button>
        </div>
      </div>
    );
  }

  return (
    <div className="of-ark" role="dialog" aria-label="Feedback på din opgave">
      <div className="of-kort">
        <button className="of-luk" onClick={onLuk} aria-label="Luk uden at svare">×</button>

        <div className="of-emoji" aria-hidden="true">🎉</div>
        <h2>Dejligt at høre!</h2>

        <div className="of-sp">Fandt du virksomheden gennem Birdly?</div>
        <div className="of-tovalg">
          <button className={"of-valg" + (viaBirdly === true ? " on" : "")}
            onClick={() => setViaBirdly(true)}>Ja</button>
          <button className={"of-valg" + (viaBirdly === false ? " on" : "")}
            onClick={() => { setViaBirdly(false); setVinder(null); }}>Nej</button>
        </div>

        {/* Kun ved "Ja", og kun hvis der faktisk er nogen at vælge imellem. */}
        {viaBirdly === true && virksomheder.length > 0 && (
          <>
            <div className="of-sp">Hvilken virksomhed løste opgaven?</div>
            <div className="of-firmaer">
              {virksomheder.map((v) => (
                <button key={v.plads}
                  className={"of-firma" + (vinder === v.plads ? " on" : "")}
                  onClick={() => setVinder(vinder === v.plads ? null : v.plads)}>
                  {v.firma || "Virksomhed"}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="of-sp">Hvordan var oplevelsen?</div>
        {/* Stjernerne er knapper, ikke ikoner: de skal kunne rammes med en tommel
            og nås med et tastatur. */}
        <div className="of-stjerner">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={"of-stjerne" + (n <= stjerner ? " on" : "")}
              onClick={() => setStjerner(n === stjerner ? 0 : n)}
              aria-label={`${n} ud af 5 stjerner`} aria-pressed={n <= stjerner}>★</button>
          ))}
        </div>

        <div className="of-sp">Hvor nemt var det at bruge Birdly?</div>
        <div className="of-nemhed">
          {NEMHED.map(([k, t]) => (
            <button key={k} className={"of-valg" + (nemhed === k ? " on" : "")}
              onClick={() => setNemhed(nemhed === k ? "" : k)}>{t}</button>
          ))}
        </div>

        <label className="st-lab" htmlFor="of-tekst">Vil du fortælle mere?</label>
        <textarea id="of-tekst" className="st-felt of-tekst" rows={3}
          placeholder="Valgfrit"
          value={fritekst} onChange={(e) => setFritekst(e.target.value)} />

        {/* ⚠️ ORDLYDEN SIGER HVAD DER SKER, ikke "må vi bruge din feedback".
            Hun skal kunne se for sig hvor det ender: hendes fornavn på birdly.dk. */}
        <label className="st-tjek of-tjek">
          <input type="checkbox" checked={mkOk} onChange={(e) => setMkOk(e.target.checked)} />
          <span>Birdly må gerne bruge min kommentar med mit fornavn på birdly.dk og i markedsføring.</span>
        </label>

        <button className="pl-mini primaer of-send" disabled={travl} onClick={send}>
          {travl ? "Sender …" : "Send feedback"}
        </button>
        <button className="pl-mini daempet" onClick={onLuk}>Spring over</button>
      </div>
    </div>
  );
}
