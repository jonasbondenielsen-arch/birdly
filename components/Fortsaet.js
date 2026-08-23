"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import { vaelgPlan, afvis, gemFeedback } from "../lib/fortsaet";

// ============================================================================
// "BEHOLD DIN OVERVÅGNING" — tilbagemeldingsblanket ved prøveudløb.
//
// ⚠️ DETTE ER IKKE EN BETALINGSSIDE. Der er ingen kortfelter, ingen Frisbii, ingen
// betalingssession, og der findes ingen kodesti herfra til betalings-kernen. Kunden
// krydser af hvad hun vil, og Jonas fakturerer i hånden. Lægger nogen en betalingsknap
// ind her, holder hverken teksterne ("Vi sender dig en faktura") eller datamodellen
// (fortsaet_svar har ingen betalingsfelter) længere.
//
// ⚠️ SAMTYKKET ER EN SPÆRRE, IKKE PYNT. Et ja udløser en faktura, altså en
// aftaleindgåelse. Knappen er derfor spærret uden flueben — men det er den TREDJE
// spærre, ikke den eneste: Edge Function'en afviser kaldet, og check-constraint
// `fortsaet_svar_konsistent` i 0083 nægter at skrive rækken. En deaktiveret knap i en
// browser er ikke en spærre.
//
// ⚠️ TRE STRAMNINGER MOD MOCKUPPEN, alle med en grund:
//   1. Privatopgave-teaseren er FLAG-STYRET (`privat_opgaver` fra serveren). Er
//      `privat_opgave_samleside` slukket, ser kunden aldrig en privat opgave — og at
//      love dem på en side der udløser en faktura er et løfte vi ikke indfrier.
//   2. Værdi-boksen viser det DEDUPEREDE antal og skjules helt ved 0. Rå
//      notice_matches overtæller 10-27 %, og "Du har modtaget 0 relevante opgaver"
//      er et argument MOD at betale — sat lige over en prisliste.
//   3. Neutral opt-out-tekst. Mockuppens formulering læste som en advarsel; her står
//      der kun hvad der faktisk sker.
// Plus en fjerde: egen variant når prøven ALLEREDE er udløbet — "udløber om -3 dage"
// må aldrig kunne stå på siden.
// ============================================================================

// ⚠️ SAMME TOKENS SOM MOCKUPPEN. Farver og radier er taget direkte fra
// "Birdly – Behold din overvågning.html", så siden er den Jonas har godkendt.
const NAVY = "#0D1B2A";
const TEAL = "#00B3A6";
const TEAL_DARK = "#009488";
const MUTED = "#64748B";
const LINE = "#E4E9EF";
const INK = "#0D1B2A";

const WRAP = { maxWidth: 500, margin: "0 auto" };
const CARD = {
  background: "#fff", border: "1px solid " + LINE, borderRadius: 20,
  padding: "26px 24px", boxShadow: "0 18px 44px -24px rgba(13,27,42,.28)",
};
const KNAP_BASE = {
  width: "100%", height: 48, border: 0, borderRadius: 12, fontWeight: 700, fontSize: 15,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
};
const FEAT_LI = { display: "flex", gap: 8, fontSize: 13.3, lineHeight: 1.4, color: "#334155" };
const TICK = {
  flex: "none", width: 15, height: 15, borderRadius: "50%", background: TEAL, color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, marginTop: 2,
};
const VALG = {
  display: "flex", gap: 9, alignItems: "center", fontSize: 13.5, color: "#334155",
  padding: "9px 11px", border: "1px solid " + LINE, borderRadius: 10, marginBottom: 7, cursor: "pointer",
};
const VALGFRIT = {
  fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase",
  letterSpacing: ".05em", marginLeft: 6,
};
const SPG = { fontSize: 14, fontWeight: 600, margin: "0 0 9px", display: "block" };
const BETING_LINK = {
  color: TEAL_DARK, fontWeight: 600, textDecoration: "none",
  borderBottom: "1px solid rgba(0,179,166,.35)",
};

// Værdierne spejler check-constraints i 0083 — ændres de her, afviser basen svaret.
const GRUNDE = [
  ["for_faa_opgaver", "Jeg har fået for få relevante opgaver"],
  ["daarligt_match", "Opgaverne har ikke matchet min virksomhed godt nok"],
  ["ikke_vaerdi_til_prisen", "Jeg har ikke fået nok værdi til prisen"],
  ["ikke_behov_endnu", "Jeg har ikke haft behov/tid til at bruge Birdly endnu"],
  ["andet", "Andet"],
];
const REENGAGE = [
  ["flere_relevante", "Flere relevante opgaver"],
  ["mere_praecise", "Mere præcise matches"],
  ["flere_private", "Flere private opgaver"],
  ["lavere_pris", "En lavere pris"],
  ["andet", "Andet"],
];

function datoDK(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("da-DK", { day: "numeric", month: "long" });
}

// ⚠️ "om -3 dage" MÅ ALDRIG KUNNE STÅ PÅ SIDEN. Den udløbne variant er ikke et
// randtilfælde: vinduet i 0083 rammer med vilje kunder hvis prøve ALLEREDE er
// passeret, så det er en helt normal tilstand for denne side.
function udloebsTekst(dageTil, udloebet) {
  if (udloebet) return null;
  if (dageTil <= 0) return "i dag";
  if (dageTil === 1) return "i morgen";
  return "om " + dageTil + " dage";
}

export default function Fortsaet({ token, start }) {
  const gyldigt = start?.ok === true;

  // Har kunden allerede svaret om denne slutdato, åbner siden direkte på kvitteringen.
  // Ellers ville hun kunne svare igen og tro at det forrige svar var væk.
  const startVisning = !gyldigt
    ? "ugyldig"
    : start.besvaret
      ? (start.vil_fortsaette ? "fortsat" : "tak")
      : "valg";

  const [visning, setVisning] = useState(startVisning);
  const [samtykke, setSamtykke] = useState(false);
  const [visHint, setVisHint] = useState(false);
  const [valgtPlan, setValgtPlan] = useState(start?.valgt_plan || null);
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState("");

  // Spørgeskemaet
  const [grund, setGrund] = useState("");
  const [stjerner, setStjerner] = useState(0);
  const [reengage, setReengage] = useState([]);
  const [fritekst, setFritekst] = useState("");

  function skift(v) {
    setVisning(v);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  async function vaelg(plan) {
    // ⚠️ Samtykket tjekkes FØR kaldet — ikke for sikkerhedens skyld (det gør serveren),
    // men for at kunden får at vide HVORFOR der ikke sker noget. Uden hintet ville
    // knappen bare føles i stykker.
    if (!samtykke) { setVisHint(true); return; }
    if (travl) return;
    setTravl(true);
    setFejl("");
    const r = await vaelgPlan(token, plan, true);
    setTravl(false);
    if (r?.ok !== true) {
      setFejl("Vi kunne ikke gemme dit valg. Prøv igen om et øjeblik.");
      return;
    }
    setValgtPlan(plan);
    skift("fortsat");
  }

  function nejTak() {
    // ⚠️ Hændelsen logges, men svaret gemmes IKKE her — grunden kender vi først efter
    // skemaet. Kaldet må aldrig blokere visningen: forlader hun siden fordi et netværk
    // hakker, har vi mistet netop det tal vi ville måle. Derfor intet await.
    afvis(token);
    skift("skema");
  }

  async function afslut() {
    if (!grund) { setFejl("Vælg en grund, så vi ved hvad vi skal gøre bedre."); return; }
    if (travl) return;
    setTravl(true);
    setFejl("");
    const r = await gemFeedback(token, {
      churn_grund: grund,
      match_vurdering: stjerner || null,
      reengage_grunde: reengage,
      fritekst: fritekst.trim() || null,
    });
    setTravl(false);
    if (r?.ok !== true) {
      setFejl("Vi kunne ikke gemme din feedback. Prøv igen om et øjeblik.");
      return;
    }
    skift("tak");
  }

  const toggleReengage = (v) =>
    setReengage((r) => (r.includes(v) ? r.filter((x) => x !== v) : [...r, v]));

  const naar = udloebsTekst(start?.dage_til ?? 0, start?.udloebet === true);
  const slutDato = datoDK(start?.slut_dato);
  const privat = start?.privat_opgaver === true;

  return (
    <div style={{ background: "linear-gradient(180deg,#F6F9FC 0%,#EDF1F6 100%)", minHeight: "100vh", padding: "30px 16px 56px", color: INK }}>
      <div style={WRAP}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 20 }}>
          <Logo />
        </div>

        {visning === "ugyldig" && (
          <div style={CARD}>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-.02em" }}>Linket virker ikke længere</h1>
            {/* ⚠️ Ukendt og udløbet token svarer ENS — også her i teksten. Skelnede vi,
                kunne man gætte sig til gyldige links ved at læse forskellen. */}
            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.55, margin: 0 }}>
              Linket er enten udløbet, eller også er der allerede svaret. Skriv til os på{" "}
              <a href="mailto:kontakt@birdly.dk" style={{ color: TEAL_DARK, fontWeight: 600 }}>kontakt@birdly.dk</a>,
              så finder vi ud af det.
            </p>
          </div>
        )}

        {visning === "valg" && (
          <div style={CARD}>
            <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 6px" }}>
              Hej{start.fornavn ? " " + start.fornavn : ""} 👋
            </p>
            <p style={{ fontSize: 14, color: MUTED, fontWeight: 500, margin: "0 0 14px" }}>
              {start.udloebet
                ? <>Din gratis prøveperiode <b>er udløbet</b>{slutDato ? " den " + slutDato : ""}.</>
                : <>Din gratis prøveperiode udløber <b>{naar}</b>.</>}
            </p>

            {/* ⚠️ SKJULT VED 0 (stramning 2). "Du har modtaget 0 relevante opgaver" er
                et argument MOD at betale, sat lige over prislisten. Tallet er det
                DEDUPEREDE — det samme hun kan tælle efter på sin egen opgaveliste. */}
            {start.antal_opgaver > 0 && (
              <div style={{ background: "#F0FBFA", border: "1px solid #B8EDE8", borderRadius: 13, padding: "13px 15px", fontSize: 14, lineHeight: 1.45, color: "#0B5F58", marginBottom: 18 }}>
                Du har modtaget <b style={{ color: TEAL_DARK }}>{start.antal_opgaver} relevante opgaver</b> gennem Birdly i din prøveperiode.
              </div>
            )}

            <p style={{ fontSize: 15, lineHeight: 1.5, color: "#334155", margin: "0 0 16px", fontWeight: 500 }}>
              Vil du beholde din overvågning og fortsætte med at modtage relevante opgaver, der matcher din virksomhed?
            </p>

            {/* ⚠️ KUN NÅR PRIVATE OPGAVER FAKTISK LEVERES (stramning 1). Serveren læser
                flaget; siden gætter aldrig. Se hovednoten. */}
            {privat && (
              <div style={{ background: "#EAF7FF", border: "1px solid #C7E8FA", borderRadius: 13, padding: "12px 14px", margin: "0 0 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0B6BA8", marginBottom: 4 }}>🚀 Snart får du også private opgaver</div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: "#2C5468" }}>
                  Inden for de kommende dage tilføjer vi private opgaver til Birdly – så du fremover kan modtage både
                  offentlige og private opgaver gennem samme overvågning, stadig kun når de matcher din virksomhed.{" "}
                  <b style={{ color: "#0B6BA8" }}>Automatisk inkluderet i dit abonnement.</b>
                </p>
              </div>
            )}

            {/* ── ÅR (hero) ── */}
            <div style={{ border: "1.5px solid " + TEAL, borderRadius: 16, padding: "18px 17px", marginBottom: 14, position: "relative", background: "#fff", boxShadow: "0 10px 30px -18px rgba(0,179,166,.55)" }}>
              <span style={{ position: "absolute", top: -11, left: 17, background: TEAL, color: "#fff", fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", padding: "3px 10px", borderRadius: 20 }}>⭐ BEDSTE VÆRDI</span>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>Årligt</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "4px 0 2px", flexWrap: "wrap" }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>4.990 kr.</span>
                <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>/år ekskl. moms</span>
                <span style={{ fontSize: 13, color: "#94A3B8", textDecoration: "line-through" }}>5.988 kr.</span>
              </div>
              <span style={{ display: "inline-block", background: "#E9FBF8", color: TEAL_DARK, fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20, margin: "2px 0 10px" }}>Spar 998 kr. – svarer til 2 måneder gratis</span>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: INK, margin: "0 0 10px" }}>Én betaling. Én faktura. Et helt år med Birdly.</p>
              <ul style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  // ⚠️ Punktet følger SAMME flag som teaseren. Stod der "og private
                  // opgaver" mens flaget var slukket, ville selve produktbeskrivelsen
                  // love noget kunden ikke får — på den side der udløser fakturaen.
                  privat ? "Offentlige og private opgaver i dit fag" : "Offentlige opgaver i dit fag",
                  "Direkte besked om relevante matches",
                  "Redigér dine matchkriterier når som helst",
                  "Én årlig faktura i stedet for månedlig bogføring",
                ].map((t) => <li key={t} style={FEAT_LI}><span style={TICK}>✓</span>{t}</li>)}
              </ul>
              <button type="button" onClick={() => vaelg("aar")} disabled={travl}
                style={{ ...KNAP_BASE, background: TEAL, color: "#fff", boxShadow: "0 12px 22px -12px rgba(0,179,166,.7)", opacity: travl ? 0.6 : 1 }}>
                {travl ? "Gemmer …" : "Vælg årsbetaling →"}
              </button>
            </div>

            {/* ── MÅNED ── */}
            <div style={{ border: "1.5px solid " + LINE, borderRadius: 16, padding: "18px 17px", marginBottom: 14, background: "#fff" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>Månedligt</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "4px 0 2px", flexWrap: "wrap" }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>499 kr.</span>
                <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>/md. ekskl. moms</span>
              </div>
              <ul style={{ listStyle: "none", margin: "10px 0 14px", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Samme fulde Birdly-adgang",
                  privat ? "Offentlige og private opgaver i dit fag" : "Offentlige opgaver i dit fag",
                  "Faktureres månedligt",
                  "Opsig når som helst – ingen binding",
                ].map((t) => <li key={t} style={FEAT_LI}><span style={TICK}>✓</span>{t}</li>)}
              </ul>
              <button type="button" onClick={() => vaelg("maaned")} disabled={travl}
                style={{ ...KNAP_BASE, background: "#fff", color: TEAL_DARK, border: "1.5px solid " + TEAL, opacity: travl ? 0.6 : 1 }}>
                {travl ? "Gemmer …" : "Vælg månedsbetaling →"}
              </button>
            </div>

            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", margin: "4px 2px 6px", fontSize: 12.8, color: "#334155", lineHeight: 1.45, cursor: "pointer" }}>
              <input type="checkbox" checked={samtykke}
                onChange={(e) => { setSamtykke(e.target.checked); if (e.target.checked) setVisHint(false); }}
                style={{ margin: "2px 0 0", width: 16, height: 16, accentColor: TEAL, flex: "none" }} />
              <span>
                Jeg accepterer Birdlys{" "}
                <a href="/abonnementsbetingelser" target="_blank" rel="noopener noreferrer" style={BETING_LINK}>abonnements-</a>{" "}
                og{" "}
                <a href="/handelsbetingelser" target="_blank" rel="noopener noreferrer" style={BETING_LINK}>handelsbetingelser</a>.
              </span>
            </label>
            {visHint && (
              <p style={{ fontSize: 12, color: "#C2410C", textAlign: "center", margin: "6px 2px 0" }}>
                Sæt flueben i betingelserne for at vælge et abonnement.
              </p>
            )}
            {fejl && <p style={{ fontSize: 12.5, color: "#C2410C", textAlign: "center", margin: "8px 2px 0" }}>{fejl}</p>}

            <p style={{ fontSize: 12.8, color: MUTED, textAlign: "center", margin: "10px 6px 4px", lineHeight: 1.5 }}>
              Uanset hvad du vælger, beholder du din nuværende opgaveliste og dine matchkriterier.
            </p>

            <div style={{ height: 1, background: LINE, margin: "20px 0 16px" }} />
            <div>
              <h3 style={{ fontSize: 15, margin: "0 0 6px", fontWeight: 700 }}>Ønsker du ikke at fortsætte?</h3>
              {/* ⚠️ NEUTRAL, IKKE ADVARENDE (stramning 3). Mockuppen skrev "stopper din
                  Birdly-overvågning, og du modtager ikke længere nye opgaver" — sandt,
                  men formuleret som en konsekvens man skal betale sig fra. Her står
                  kun hvad der sker, og hvad hun beholder. */}
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: "0 0 12px" }}>
                {start.udloebet
                  ? "Så afslutter vi din prøveperiode, og du modtager ikke flere nye opgaver. Du beholder din nuværende opgaveliste og dine matchkriterier."
                  : <>Så slutter din prøveperiode som planlagt{slutDato ? " den " + slutDato : ""}, og du modtager ikke flere nye opgaver. Du beholder din nuværende opgaveliste og dine matchkriterier.</>}
              </p>
              <button type="button" onClick={nejTak}
                style={{ width: "100%", height: 44, borderRadius: 11, background: "#fff", border: "1.5px solid #CBD5E1", color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Nej tak – jeg ønsker ikke at fortsætte
              </button>
            </div>
          </div>
        )}

        {visning === "fortsat" && (
          <div style={CARD}>
            <div style={{ textAlign: "center", padding: "8px 4px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E9FBF8", color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", margin: "6px auto 16px", fontSize: 28 }}>✓</div>
              <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.01em", margin: "0 0 10px" }}>Tak – din overvågning fortsætter</h2>
              {/* ⚠️ "Vi sender dig en faktura" — IKKE "din betaling er gennemført".
                  Der er ikke trukket en krone; Jonas fakturerer i hånden. */}
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.55, margin: "0 auto 8px", maxWidth: 380 }}>
                Vi sender dig en faktura, så din Birdly-overvågning fortsætter uden afbrydelse. Du skal ikke foretage dig mere.
              </p>
              <p style={{ color: MUTED, fontSize: 12.5, margin: 0 }}>
                {valgtPlan === "aar"
                  ? "Valgt: Årligt – 4.990 kr./år ekskl. moms"
                  : valgtPlan === "maaned"
                    ? "Valgt: Månedligt – 499 kr./md. ekskl. moms"
                    : ""}
              </p>
            </div>
          </div>
        )}

        {visning === "skema" && (
          <div style={CARD}>
            <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.01em", margin: "0 0 4px" }}>Inden du går – må vi spørge om én ting?</h2>
            <p style={{ fontSize: 13.5, color: MUTED, margin: "0 0 18px", lineHeight: 1.5 }}>Din feedback hjælper os med at gøre Birdly bedre.</p>

            <div style={{ marginBottom: 18 }}>
              <span style={SPG}>Hvad er den vigtigste grund til, at du ikke ønsker at fortsætte?</span>
              {GRUNDE.map(([v, t]) => (
                <label key={v} style={{ ...VALG, borderColor: grund === v ? TEAL : LINE }}>
                  <input type="radio" name="grund" checked={grund === v} onChange={() => { setGrund(v); setFejl(""); }} style={{ accentColor: TEAL, width: 16, height: 16 }} />
                  {t}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={SPG}>
                Hvordan har opgaverne generelt matchet din virksomhed?
                <span style={VALGFRIT}>Valgfrit</span>
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setStjerner(n)} aria-label={n + " ud af 5"}
                    style={{ width: 38, height: 38, border: "1px solid " + (n <= stjerner ? "#F5D488" : LINE), borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer", color: n <= stjerner ? "#F5B301" : "#CBD5E1", background: n <= stjerner ? "#FFFBEB" : "#fff" }}>★</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={SPG}>
                Hvad kunne få dig til at bruge Birdly igen?
                <span style={VALGFRIT}>Valgfrit</span>
              </span>
              {REENGAGE.map(([v, t]) => (
                <label key={v} style={{ ...VALG, borderColor: reengage.includes(v) ? TEAL : LINE }}>
                  <input type="checkbox" checked={reengage.includes(v)} onChange={() => toggleReengage(v)} style={{ accentColor: TEAL, width: 16, height: 16 }} />
                  {t}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={SPG}>
                Er der noget, du synes vi skal gøre bedre?
                <span style={VALGFRIT}>Valgfrit</span>
              </span>
              {/* maxLength spejler FRITEKST_MAKS i Edge Function'en. Serveren beskærer
                  alligevel — feltet her forhindrer bare at kunden skriver 3.000 tegn
                  og ser en tredjedel forsvinde uden forklaring. */}
              <textarea value={fritekst} onChange={(e) => setFritekst(e.target.value)} maxLength={2000}
                placeholder="Skriv gerne et par ord – al feedback er værdifuld for os."
                style={{ width: "100%", minHeight: 74, border: "1px solid #D6DEE7", borderRadius: 10, padding: "10px 12px", fontFamily: "inherit", fontSize: 13.5, resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {fejl && <p style={{ fontSize: 12.5, color: "#C2410C", margin: "0 2px 8px" }}>{fejl}</p>}
            <button type="button" onClick={afslut} disabled={travl}
              style={{ ...KNAP_BASE, marginTop: 6, background: NAVY, color: "#fff", opacity: travl ? 0.6 : 1 }}>
              {travl ? "Gemmer …" : "Afslut min prøveperiode"}
            </button>
          </div>
        )}

        {visning === "tak" && (
          <div style={CARD}>
            <div style={{ textAlign: "center", padding: "8px 4px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E9FBF8", color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", margin: "6px auto 16px", fontSize: 28 }}>🐦</div>
              <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.01em", margin: "0 0 10px" }}>Tak fordi du prøvede Birdly</h2>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.55, margin: "0 auto 8px", maxWidth: 380 }}>
                {start?.udloebet
                  ? "Din prøveperiode er afsluttet, og din opgaveovervågning stopper."
                  : "Din prøveperiode afsluttes som planlagt, og din opgaveovervågning stopper ved udløb."}
              </p>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.55, margin: "0 auto 8px", maxWidth: 380 }}>
                Tak for din feedback – den bruger vi til at gøre Birdly bedre. Du er altid velkommen tilbage.
              </p>
              <a href="/" style={{ display: "inline-block", marginTop: 16, height: 46, lineHeight: "46px", padding: "0 22px", borderRadius: 11, background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>Gå til Birdly.dk</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
