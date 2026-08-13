"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import {
  KORT3, MAKS_TEGN, SAMTYKKE_TITEL, SAMTYKKE_BROED, KNAP_HJAELP, NOTE_NEDERST,
  kvitteringProeve, kvitteringBetalende,
} from "../lib/feedbackKort3";
import { gemKort3 } from "../lib/feedback";

// ============================================================================
// DET KORTE FEEDBACK-SKEMA — 3 spørgsmål på ÉN side.
//
// ⚠️ ALLE TRE SPØRGSMÅL PÅ ÉN SIDE, i modsætning til det lange skema (Forlaeng.js),
// som tager ét ad gangen. Ni spørgsmål har brug for en fremdriftsfølelse; tre har det
// ikke — der ville en tæller og tre klik få en to-minutters opgave til at ligne et
// forløb. Kunden skal kunne se hele opgaven med det samme og vurdere at den er lille.
//
// ⚠️ SAMTYKKET ER BETINGELSEN FOR DE 7 DAGE (Jonas' beslutning 13-08-2026). Knappen er
// dæmpet og deaktiveret indtil fluebenet er sat, og lyser når det er. Serveren
// håndhæver det samme — en deaktiveret knap i en browser er ikke en spærre.
// Det er en ANDEN model end det lange skema, hvor samtykket udtrykkeligt IKKE må være
// en betingelse. Blander du de to, ændrer du hvad kunden har givet.
//
// ⚠️ INGEN Trustpilot eller Google. Svarene er interne, og noten nederst lover det.
// ============================================================================

// ⚠️ SAMME TOKENS SOM FORLAENG.JS OG SAMLESIDEN. Kopieret bevidst: ændres samlesidens
// look, skal disse følge med. Feedback-siderne er token-sider som kundens opgaveliste
// og skal føles som SAMME produkt.
const WRAP = { maxWidth: 820, margin: "0 auto", padding: "24px 18px 64px" };
const CARD = { background: "#fff", border: "1px solid #E6EAEF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" };
const TEAL = "#1E9E8A";
const NAVY = "#1B2733";
const MUTED = "#6B7785";
const KNAP = { border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const KNAP_PRIMARY = { ...KNAP, background: TEAL, color: "#fff" };
const FELT = {
  width: "100%", fontFamily: "inherit", fontSize: 15.5, lineHeight: 1.6, color: NAVY,
  padding: "13px 14px", border: "1px solid #D7DDE5", borderRadius: 10, resize: "vertical",
  boxSizing: "border-box",
};

export default function FeedbackKort3({ token, start }) {
  const [svar, setSvar] = useState({});
  const [samtykke, setSamtykke] = useState(false);
  const [gemmer, setGemmer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [fejl, setFejl] = useState("");

  const betalende = !!start?.betalende;
  const fornavn = start?.fornavn || "";

  // Knappen lyser når fluebenet er sat — præcis den betingelse teksten under den
  // lover. Et tomt førstespørgsmål stopper først ved klik, med en rolig linje i
  // stedet for en knap der ser i stykker ud.
  const kanSende = samtykke && !gemmer;

  function saet(id, v) {
    setSvar((s) => ({ ...s, [id]: v.slice(0, MAKS_TEGN) }));
  }

  async function send() {
    if (!(svar.hvordan_fungeret || "").trim()) {
      setFejl("Skriv et par ord i det første felt — så har vi noget at læse.");
      return;
    }
    setGemmer(true);
    setFejl("");
    try {
      const r = await gemKort3(token, { svar, markedsfoering_ok: samtykke });
      if (!r?.ok) throw new Error("kunne_ikke_gemme");
      setResultat(r);
    } catch {
      setFejl("Vi kunne ikke gemme dine svar. Prøv igen om et øjeblik — dine svar står her stadig.");
    } finally {
      setGemmer(false);
    }
  }

  // ---------- KVITTERING ----------
  // Serverens svar afgør teksten, ikke klientens gæt: den ved om forlængelsen faktisk
  // blev givet. Er kunden betalende, loves der intet om en dato.
  if (resultat) {
    const k = resultat.betalende ? kvitteringBetalende(fornavn) : kvitteringProeve(fornavn);
    return (
      <Ramme>
        <h1 style={{ fontSize: 24, lineHeight: 1.35, margin: "0 0 14px", color: NAVY }}>{k.overskrift}</h1>
        {k.afsnit.map((t, i) => (
          <p key={i} style={{ margin: "0 0 12px", color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>{t}</p>
        ))}
        {/* Ærlig tilstand: svaret er gemt, men datoen kunne ikke flyttes. Vi lover
            ikke dage vi ikke har givet — det ville kunden opdage ved trækket. */}
        {!resultat.betalende && resultat.forlaenget === false && (
          <p style={{ margin: "0 0 12px", color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
            {resultat.allerede_forlaenget
              ? "Din prøveperiode er allerede forlænget én gang, så vi har ikke lagt flere dage til."
              : "Vi er ved at lægge dagene til din prøveperiode. Hører du ikke fra os inden for et døgn, så skriv til support@birdly.dk."}
          </p>
        )}
        <Link href="/" style={{ ...KNAP_PRIMARY, textDecoration: "none", display: "inline-block", marginTop: 6 }}>Til birdly.dk</Link>
      </Ramme>
    );
  }

  // ---------- LINKET GÆLDER IKKE ----------
  // Ugyldigt token, udløbet liste eller slukket afbryder giver samme side. Vi røber
  // ikke om et token findes.
  if (!start?.ok || !start?.aktiv) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 24, margin: "0 0 8px", color: NAVY }}>Linket gælder ikke længere</h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Har du spørgsmål, så skriv til os på support@birdly.dk — vi svarer altid.
        </p>
      </Ramme>
    );
  }

  // ---------- ALLEREDE SVARET ----------
  // Rolig side, ikke en fejl. Og ingen ny forlængelse.
  if (start.allerede_svaret) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 24, margin: "0 0 8px", color: NAVY }}>Du har allerede sendt din anmeldelse</h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Tusind tak for den — vi har læst den. Har du flere tanker, er du altid velkommen
          til at skrive til os på support@birdly.dk.
        </p>
      </Ramme>
    );
  }

  // ---------- SKEMAET ----------
  return (
    <Ramme>
      <h1 style={{ fontSize: 23, lineHeight: 1.3, margin: "0 0 6px", color: NAVY }}>
        {fornavn ? `Hej ${fornavn} — hvordan går det med Birdly?` : "Hvordan går det med Birdly?"}
      </h1>
      <p style={{ margin: "0 0 26px", color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
        Tre spørgsmål. Det tager to minutter, og vi læser hvert eneste svar.
      </p>

      {KORT3.map((q) => (
        <div key={q.id} style={{ marginBottom: 22 }}>
          <label htmlFor={q.id} style={{ display: "block", fontSize: 17, fontWeight: 700, color: NAVY, lineHeight: 1.4 }}>
            {q.spm}
          </label>
          <p style={{ margin: "4px 0 10px", color: MUTED, fontSize: 14.5, lineHeight: 1.5 }}>{q.hjaelp}</p>
          <textarea
            id={q.id}
            value={svar[q.id] || ""}
            onChange={(e) => saet(q.id, e.target.value)}
            rows={q.rows}
            style={FELT}
          />
        </div>
      ))}

      {/* SAMTYKKET — betingelsen for de 7 dage. IKKE forhåndsafkrydset. */}
      <div style={{ marginTop: 26, paddingTop: 20, borderTop: "1px solid #E6EAEF" }}>
        <label style={{ display: "flex", gap: 11, alignItems: "flex-start", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={samtykke}
            onChange={(e) => setSamtykke(e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: TEAL, flex: "0 0 18px" }}
          />
          <span>
            <b style={{ fontSize: 15.5, color: NAVY, lineHeight: 1.5, display: "block" }}>{SAMTYKKE_TITEL}</b>
            <span style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, display: "block", marginTop: 5 }}>
              {SAMTYKKE_BROED}
            </span>
          </span>
        </label>
      </div>

      {fejl && <p style={{ color: "#B03A3A", fontSize: 14, marginTop: 16 }}>{fejl}</p>}

      <div style={{ marginTop: 22 }}>
        <button
          type="button"
          onClick={send}
          disabled={!kanSende}
          style={{
            ...KNAP_PRIMARY,
            // Dæmpet indtil fluebenet er sat, lyser når det er. Markøren skifter med,
            // så knappen ikke bare ser mat ud, men FØLES lukket.
            opacity: kanSende ? 1 : 0.45,
            cursor: kanSende ? "pointer" : "not-allowed",
          }}
        >
          {gemmer ? "Sender …" : betalende ? "Send min anmeldelse" : "Send og få 7 dage mere"}
        </button>
        {!samtykke && (
          <p style={{ margin: "10px 0 0", fontSize: 13.5, color: MUTED, lineHeight: 1.55 }}>
            {/* Betalende får ingen dage, så løftet om prøvetid ville være forkert for
                hende. Samme flueben, ærlig begrundelse. */}
            {betalende
              ? "Sæt flueben ovenfor for at sende din anmeldelse."
              : KNAP_HJAELP}
          </p>
        )}
      </div>

      <p style={{ margin: "26px 0 0", paddingTop: 16, borderTop: "1px solid #EEF1F5", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
        {NOTE_NEDERST}
      </p>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------

// Rammen er samlesidens og Forlaeng.js': centreret logo øverst, indhold i et hvidt kort.
function Ramme({ children }) {
  return (
    <main style={WRAP}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 22px" }}>
        <Link href="/" aria-label="Birdly forside"><Logo /></Link>
      </div>
      <div style={CARD}>{children}</div>
    </main>
  );
}
