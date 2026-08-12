"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { SPOERGSMAAL, spmTekst } from "../lib/feedbackSpoergsmaal";
import { gemFeedback } from "../lib/feedback";

// ============================================================================
// FEEDBACK-SKEMA — 7 ekstra prøvedage mod ærlige svar.
//
// ÉT SPØRGSMÅL AD GANGEN. Ni spørgsmål på én side ser ud som et arbejde man ikke har
// tid til; ét ad gangen med en tæller føles som noget der er ved at være færdigt.
// Fremdriften er hele grunden til at folk gennemfører.
//
// ⚠️ INGEN SMILEYS. Almindelige svarkort. Smileys presser svaret mod midten og gør
// det svært at være konkret negativ — og det er præcis den kritik der er værd at få.
//
// ⚠️ INGEN Trustpilot eller Google. Dette er internt feedback. Incitament for
// offentlige anmeldelser er forbudt af begge platforme, og "review gating" (kun at
// spørge de tilfredse) er det også.
// ============================================================================

// ⚠️ SAMME TOKENS SOM SAMLESIDEN (components/MineOpgaver.js), ikke forsidens.
// Feedback-siderne er token-sider som kundens opgaveliste, og de skal føles som
// SAMME produkt — ikke som en formular der er limet på. Værdierne er kopieret
// bevidst: ændres samlesidens look, skal disse følge med.
const WRAP = { maxWidth: 820, margin: "0 auto", padding: "24px 18px 64px" };
const CARD = { background: "#fff", border: "1px solid #E6EAEF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" };
const TEAL = "#1E9E8A";
const NAVY = "#1B2733";
const MUTED = "#6B7785";
const KNAP = { border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const KNAP_PRIMARY = { ...KNAP, background: TEAL, color: "#fff" };
const KNAP_SEKUNDAER = { ...KNAP, background: "#fff", color: NAVY, border: "1px solid #D7DDE5" };

export default function Forlaeng({ token, start }) {
  const [trin, setTrin] = useState(0);
  const [svar, setSvar] = useState({});
  const [fritekst, setFritekst] = useState("");
  const [samtykkeUdtalelse, setSamtykkeUdtalelse] = useState(false);
  const [samtykkeInterview, setSamtykkeInterview] = useState(false);
  const [gemmer, setGemmer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [fejl, setFejl] = useState("");

  const q = SPOERGSMAAL[trin];
  const sidste = trin === SPOERGSMAAL.length - 1;
  const tekst = useMemo(() => spmTekst(q, svar), [q, svar]);

  // Kan vi gå videre? Fritekst har et minimum; de øvrige kræver blot et valg.
  const kanVidere = q.type === "tekst"
    ? fritekst.trim().length >= q.minLaengde
    : q.type === "flere"
      ? (svar[q.id]?.length || 0) > 0
      : !!svar[q.id];

  function vaelgEn(key, label) {
    setSvar((s) => ({ ...s, [q.id]: { key, label } }));
  }

  function vaelgFlere(key, label) {
    setSvar((s) => {
      const nuvaerende = s[q.id] || [];
      const har = nuvaerende.some((x) => x.key === key);
      if (har) return { ...s, [q.id]: nuvaerende.filter((x) => x.key !== key) };
      // Maks nås ⇒ ældste valg falder ud, så et klik ALDRIG er en blindgyde. Alternativet
      // (ignorér klikket) ser ud som om knappen er i stykker.
      const naeste = [...nuvaerende, { key, label }];
      return { ...s, [q.id]: naeste.slice(-q.maks) };
    });
  }

  async function afslut() {
    setGemmer(true);
    setFejl("");
    try {
      const r = await gemFeedback(token, {
        svar: { ...svar, fritekst: { key: "fritekst", label: fritekst.trim() } },
        fritekst: fritekst.trim(),
        samtykke_udtalelse: samtykkeUdtalelse,
        samtykke_interview: samtykkeInterview,
      });
      if (!r?.ok) throw new Error("kunne_ikke_gemme");
      setResultat(r);
    } catch {
      setFejl("Vi kunne ikke gemme dine svar. Prøv igen om et øjeblik — dine svar står her stadig.");
    } finally {
      setGemmer(false);
    }
  }

  // ---------- TAK-SIDE ----------
  if (resultat) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 26, margin: "0 0 8px", color: NAVY }}>Tusind tak for din hjælp</h1>
        <p style={{ margin: "0 0 12px", color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Din feedback er gemt.{" "}
          {resultat.forlaenget_til ? (
            <>Din gratis prøveperiode er forlænget med 14 dage og løber nu til{" "}
              <b style={{ color: NAVY }}>{fmtDato(resultat.forlaenget_til)}</b>.</>
          ) : (
            // Ærlig tilstand: skemaet er gemt, men datoen kunne ikke flyttes. Vi lover
            // ikke en dato vi ikke kan holde — så ville kunden opdage det ved trækket.
            <>Vi er ved at forlænge din prøveperiode. Får du ikke en bekræftelse inden for et døgn, så skriv til os på hello@birdly.dk.</>
          )}
        </p>
        <p style={{ margin: "0 0 18px", color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
          Vi bruger dine svar til at gøre opgaverne og oplevelsen i Birdly bedre.
        </p>
        <Link href="/" style={{ ...KNAP_PRIMARY, textDecoration: "none", display: "inline-block" }}>Til birdly.dk</Link>
      </Ramme>
    );
  }

  // ---------- TILBUDDET GÆLDER IKKE ----------
  if (!start?.ok || !start?.aktiv) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 24, margin: "0 0 8px", color: NAVY }}>Tilbuddet er ikke aktivt</h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Linket gælder ikke længere. Har du spørgsmål til din prøveperiode, så skriv til
          os på hello@birdly.dk — vi svarer altid.
        </p>
      </Ramme>
    );
  }
  if (start.allerede_brugt) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 24, margin: "0 0 8px", color: NAVY }}>Du har allerede givet feedback</h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Tak for det — det hjalp os.{" "}
          {start.forlaenget_til && <>Din prøveperiode løber til <b style={{ color: NAVY }}>{fmtDato(start.forlaenget_til)}</b>.</>}
        </p>
      </Ramme>
    );
  }
  if (!start.i_trial) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 24, margin: "0 0 8px", color: NAVY }}>Tilbuddet gælder prøveperioden</h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 15.5, lineHeight: 1.6 }}>
          Din prøveperiode er slut — men vi vil stadig meget gerne høre hvad du synes.
          Skriv til os på hello@birdly.dk.
        </p>
      </Ramme>
    );
  }

  // ---------- SKEMAET ----------
  return (
    <Ramme>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 13.5, color: MUTED, fontWeight: 600, whiteSpace: "nowrap" }}>
          {trin + 1} af {SPOERGSMAAL.length}
        </span>
        <div style={{ flex: 1, height: 6, background: "#E6EAEF", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${((trin + 1) / SPOERGSMAAL.length) * 100}%`, height: "100%", background: TEAL, transition: "width .25s" }} />
        </div>
      </div>

      <h1 style={{ fontSize: 21, lineHeight: 1.35, margin: "0 0 6px", color: NAVY }}>{tekst}</h1>
      {q.hjaelp && <p style={{ margin: "0 0 16px", color: MUTED, fontSize: 14.5 }}>{q.hjaelp}</p>}

      {q.type === "tekst" ? (
        <>
          <textarea
            value={fritekst}
            onChange={(e) => setFritekst(e.target.value.slice(0, q.maksLaengde))}
            placeholder={q.hint}
            rows={6}
            style={{
              width: "100%", fontFamily: "inherit", fontSize: 15.5, lineHeight: 1.6, color: NAVY,
              padding: "13px 14px", border: "1px solid #D7DDE5", borderRadius: 10, resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED, marginTop: 6 }}>
            <span>{fritekst.trim().length < q.minLaengde ? `Mindst ${q.minLaengde} tegn` : "Tak — det er nok"}</span>
            <span>{fritekst.length}/{q.maksLaengde}</span>
          </div>

          {/* SAMTYKKER — frivillige, og IKKE forhåndsafkrydsede. Interview er
              udtrykkeligt ikke en betingelse for de 14 dage; ellers købte vi et
              interview, og så var svarene ikke længere frie. */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #E6EAEF" }}>
            <Tilvalg checked={samtykkeUdtalelse} onChange={setSamtykkeUdtalelse}>
              Birdly må kontakte mig om at bruge min kommentar som kundeudtalelse.
            </Tilvalg>
            <Tilvalg checked={samtykkeInterview} onChange={setSamtykkeInterview}>
              Birdly må kontakte mig om en kort samtale på 10-15 minutter.
            </Tilvalg>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
              Begge er frivillige. Du får dine 7 ekstra dage, uanset om du sætter flueben.
            </p>

            {/* OPLYSNING, ikke samtykke. Fluebenene ovenfor er det aktive samtykke —
                denne linje sikrer bare at kunden VED det, inden hun skriver. Bevidst
                afdæmpet og placeret lige over send-knappen, hvor den bliver læst uden
                at stå i vejen. Rør ikke fluebenenes logik for at "forenkle" til denne
                linje: en oplysning er ikke et samtykke. */}
            <p style={{ margin: "14px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55, paddingTop: 12, borderTop: "1px solid #EEF1F5" }}>
              Birdly må gerne bruge jeres firmanavn og feedback som kundeudtalelse på vores
              hjemmeside og i markedsføring i fremtiden. Vil du ikke det, så skriv det i din
              kommentar — så gør vi det ikke.
            </p>
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          {q.svar.map(([key, label]) => {
            const valgt = q.type === "flere"
              ? (svar[q.id] || []).some((x) => x.key === key)
              : svar[q.id]?.key === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => (q.type === "flere" ? vaelgFlere(key, label) : vaelgEn(key, label))}
                style={{
                  textAlign: "left", fontFamily: "inherit", fontSize: 15.5, color: NAVY, cursor: "pointer",
                  padding: "13px 16px", borderRadius: 10,
                  // Valgt: teal kant + svag teal flade, samme sprog som samlesidens
                  // "ok"-besked (#F1FAF8 / #BFE7DF). Ikke en ny farvefamilie.
                  border: valgt ? `1.5px solid ${TEAL}` : "1px solid #D7DDE5",
                  background: valgt ? "#F1FAF8" : "#fff",
                  fontWeight: valgt ? 700 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {fejl && <p style={{ color: "#B03A3A", fontSize: 14, marginTop: 14 }}>{fejl}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        {trin > 0 && (
          <button type="button" style={KNAP_SEKUNDAER} onClick={() => setTrin((t) => t - 1)}>Tilbage</button>
        )}
        {sidste ? (
          <button type="button" style={{ ...KNAP_PRIMARY, opacity: !kanVidere || gemmer ? 0.5 : 1 }}
            onClick={afslut} disabled={!kanVidere || gemmer}>
            {gemmer ? "Sender …" : "Send og få 7 dage mere"}
          </button>
        ) : (
          <button type="button" style={{ ...KNAP_PRIMARY, opacity: kanVidere ? 1 : 0.5 }}
            onClick={() => setTrin((t) => t + 1)} disabled={!kanVidere}>
            Næste
          </button>
        )}
      </div>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------

// Rammen er samlesidens: centreret logo øverst, indhold i et hvidt kort. Præcis samme
// WRAP og CARD som MineOpgaver, så en kunde der kender sin opgaveliste genkender siden
// med det samme.
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

function Tilvalg({ checked, onChange, children }) {
  return (
    <label style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "7px 0", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3, width: 17, height: 17, accentColor: TEAL, flex: "0 0 17px" }}
      />
      <span style={{ fontSize: 14.5, color: NAVY, lineHeight: 1.55 }}>{children}</span>
    </label>
  );
}

function fmtDato(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}
