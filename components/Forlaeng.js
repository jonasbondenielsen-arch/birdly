"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { SPOERGSMAAL, spmTekst } from "../lib/feedbackSpoergsmaal";
import { gemFeedback } from "../lib/feedback";
import "../app/forside.css";

// ============================================================================
// FEEDBACK-SKEMA — 14 ekstra prøvedage mod ærlige svar.
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

const NAVY = "#0D274A";
const MUTED = "#5A6678";
const TEAL = "#00B3A6";

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
        <h1 style={{ fontSize: 30 }}>Tusind tak for din hjælp</h1>
        <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
          Din feedback er gemt.{" "}
          {resultat.forlaenget_til ? (
            <>Din gratis prøveperiode er forlænget med 14 dage og løber nu til <b>{fmtDato(resultat.forlaenget_til)}</b>.</>
          ) : (
            // Ærlig tilstand: skemaet er gemt, men datoen kunne ikke flyttes. Vi lover
            // ikke en dato vi ikke kan holde — så ville kunden opdage det ved trækket.
            <>Vi er ved at forlænge din prøveperiode. Får du ikke en bekræftelse inden for et døgn, så skriv til os på hello@birdly.dk.</>
          )}
        </p>
        <p className="sub" style={{ marginLeft: "auto", marginRight: "auto", fontSize: 15 }}>
          Vi bruger dine svar til at gøre opgaverne og oplevelsen i Birdly bedre.
        </p>
        <div className="cta" style={{ justifyContent: "center", marginTop: 8 }}>
          <Link href="/" className="btn btn-teal">Til birdly.dk</Link>
        </div>
      </Ramme>
    );
  }

  // ---------- TILBUDDET GÆLDER IKKE ----------
  if (!start?.ok || !start?.aktiv) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 28 }}>Tilbuddet er ikke aktivt</h1>
        <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
          Linket gælder ikke længere. Har du spørgsmål til din prøveperiode, så skriv til
          os på hello@birdly.dk — vi svarer altid.
        </p>
      </Ramme>
    );
  }
  if (start.allerede_brugt) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 28 }}>Du har allerede givet feedback</h1>
        <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
          Tak for det — det hjalp os.{" "}
          {start.forlaenget_til && <>Din prøveperiode løber til <b>{fmtDato(start.forlaenget_til)}</b>.</>}
        </p>
      </Ramme>
    );
  }
  if (!start.i_trial) {
    return (
      <Ramme>
        <h1 style={{ fontSize: 28 }}>Tilbuddet gælder prøveperioden</h1>
        <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
          Din prøveperiode er slut — men vi vil stadig meget gerne høre hvad du synes.
          Skriv til os på hello@birdly.dk.
        </p>
      </Ramme>
    );
  }

  // ---------- SKEMAET ----------
  return (
    <Ramme bred>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 13.5, color: MUTED, fontWeight: 600, whiteSpace: "nowrap" }}>
          Spørgsmål {trin + 1} af {SPOERGSMAAL.length}
        </span>
        <div style={{ flex: 1, height: 6, background: "#E6EAEF", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${((trin + 1) / SPOERGSMAAL.length) * 100}%`, height: "100%", background: TEAL, transition: "width .25s" }} />
        </div>
      </div>

      <h1 style={{ fontSize: 24, lineHeight: 1.35, margin: "0 0 6px", color: NAVY, textAlign: "left" }}>{tekst}</h1>
      {q.hjaelp && <p style={{ margin: "0 0 16px", color: MUTED, fontSize: 14.5, textAlign: "left" }}>{q.hjaelp}</p>}

      {q.type === "tekst" ? (
        <>
          <textarea
            value={fritekst}
            onChange={(e) => setFritekst(e.target.value.slice(0, q.maksLaengde))}
            placeholder={q.hint}
            rows={6}
            style={{
              width: "100%", fontFamily: "inherit", fontSize: 15.5, lineHeight: 1.6, color: NAVY,
              padding: "13px 14px", border: "1.5px solid #D9E2EC", borderRadius: 12, resize: "vertical",
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
              Begge er frivillige. Du får dine 14 ekstra dage, uanset om du sætter flueben.
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
                  padding: "13px 16px", borderRadius: 12,
                  border: valgt ? `1.5px solid ${TEAL}` : "1.5px solid #D9E2EC",
                  background: valgt ? "#EFFBF9" : "#fff",
                  fontWeight: valgt ? 600 : 400,
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
          <button type="button" className="btn btn-ghost" onClick={() => setTrin((t) => t - 1)}>Tilbage</button>
        )}
        {sidste ? (
          <button type="button" className="btn btn-teal" onClick={afslut} disabled={!kanVidere || gemmer}>
            {gemmer ? "Sender …" : "Send og få 14 dage mere"}
          </button>
        ) : (
          <button type="button" className="btn btn-teal" onClick={() => setTrin((t) => t + 1)} disabled={!kanVidere}>
            Næste
          </button>
        )}
      </div>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------

function Ramme({ children, bred = false }) {
  return (
    <div className="birdly-home">
      <header>
        <div className="wrap bar">
          <Logo height={32} />
          <div className="right">
            <Link href="/" className="nav-cta">Til birdly.dk</Link>
          </div>
        </div>
      </header>
      <section className="hero">
        <div className={"wrap" + (bred ? "" : " center")} style={{ maxWidth: bred ? 640 : 620, position: "relative", zIndex: 2 }}>
          {children}
        </div>
      </section>
    </div>
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
