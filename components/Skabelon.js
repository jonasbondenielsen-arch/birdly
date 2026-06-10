"use client";

import { useState } from "react";
import { Logo } from "./Logo";

// Bud-skabelon (Fase D / S1-skelet). Forlængelse af delesidens design. Forudfylder KUN
// fra det vi har (delesidens Edge Function): titel, ordregiver, frist, beløb, område,
// geografi, varighed, SMV, kunde-navn/CVR. Tildelingskriterier/referencekrav/kontakt-
// email forudfyldes i et follow-up når parseren er udvidet — indtil da er de guidet.
//
// Tre vejlednings-lag: (1) intro øverst, (2) chip pr. felt (grøn=Birdly/gul=udfyld selv),
// (3) note pr. sektion. Mobil-først. Token-resolve sker server-side i page.js.

const TEAL = "#1E9E8A";
const NAVY = "#1B2733";
const INK = "#41505E";
const MUTED = "#6B7785";
const LINE = "#E6EAEF";

const WRAP = { maxWidth: 780, margin: "0 auto", padding: "20px 16px 72px" };
const CARD = { background: "#fff", border: "1px solid " + LINE, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", marginTop: 16 };
const SECTION_LABEL = { fontSize: 12.5, color: TEAL, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" };
const H2 = { fontSize: 20, color: NAVY, margin: "6px 0 4px", fontWeight: 700 };
const BTN_PRIMARY = { display: "inline-block", background: TEAL, color: "#fff", fontWeight: 700, borderRadius: 12, padding: "13px 20px", textDecoration: "none", textAlign: "center" };
const BTN_OUTLINE = { display: "inline-block", color: NAVY, fontWeight: 600, border: "1px solid #CBD2DA", borderRadius: 10, padding: "11px 16px", textDecoration: "none", textAlign: "center", background: "#fff" };
const INPUT = { width: "100%", padding: "11px 13px", border: "1px solid " + LINE, borderRadius: 10, fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" };

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("da-DK", { dateStyle: "long" });
}
function fmtBelob(amount, currency) {
  if (amount == null) return "Ikke oplyst i udbuddet";
  return new Intl.NumberFormat("da-DK").format(Math.round(amount)) + (currency ? " " + currency : "");
}
function regionText(n) {
  if (n?.nationwide) return "Hele landet";
  if (Array.isArray(n?.nuts_codes) && n.nuts_codes.length) return n.nuts_codes.join(", ");
  return "—";
}

// Lag 2 — felt-chips.
function Chip({ kind, reason }) {
  const green = kind === "green";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
      padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap",
      background: green ? "#E5F7EF" : "#FDF3DC", color: green ? "#197A66" : "#92670A",
    }}>
      <span aria-hidden>{green ? "🟢" : "🟡"}</span>
      {green ? "Udfyldt af Birdly — tjek efter" : "Udfyld selv"}
      {!green && reason ? <span style={{ fontWeight: 400 }}>· {reason}</span> : null}
    </span>
  );
}

// Lag 3 — sektions-note.
function Note({ children }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "#F6F8FA", border: "1px solid " + LINE, borderRadius: 10, padding: "10px 12px", margin: "10px 0 14px", color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>
      <span aria-hidden style={{ flex: "0 0 auto", marginTop: 1 }}>💡</span>
      <em style={{ fontStyle: "italic" }}>{children}</em>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", padding: "9px 0", borderBottom: "1px solid #F0F2F5" }}>
      <div style={{ flex: "0 0 150px", color: MUTED, fontSize: 14 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 180, fontWeight: 600, fontSize: 15, color: NAVY }}>{children}</div>
    </div>
  );
}

const EXCLUSION_GROUNDS = [
  "Domme for korruption, bestikkelse eller svig",
  "Hvidvask eller finansiering af terrorisme",
  "Terrorhandlinger eller forbrydelser mod EU's finansielle interesser",
  "Børnearbejde og menneskehandel",
  "Ubetalt, forfalden skat eller sociale bidrag (restancer)",
  "Konkurs, insolvens eller likvidation",
  "Alvorlige forsømmelser i fagligt henseende",
  "Konkurrencefordrejende aftaler eller interessekonflikt",
  "Russisk ejerskab/tilknytning (sanktion art. 5k, forordning 833/2014)",
];

export default function Skabelon({ token, data }) {
  // Sektioner kunden kan markere som gennemgået → fremskridt.
  const CONTENT = ["overblik", "tilbudsbrev", "espd", "referencer", "pris", "kvalitet", "formalia"];
  const [done, setDone] = useState({});
  const doneCount = CONTENT.filter((k) => done[k]).length;
  const toggle = (k) => setDone((s) => ({ ...s, [k]: !s[k] }));

  if (!data || !data.found) {
    return (
      <main style={{ ...WRAP, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 28px" }}><Logo /></div>
        <div style={CARD}>
          <h1 style={H2}>Linket er ugyldigt eller udløbet</h1>
          <p style={{ color: MUTED, lineHeight: 1.6 }}>Vi kunne ikke finde udbuddet bag dette link.</p>
        </div>
      </main>
    );
  }

  const n = data.notice || {};
  const c = data.customer || {};
  const cvrLookup = c.cvr ? `https://datacvr.virk.dk/enhed/virksomhed/${encodeURIComponent(c.cvr)}` : null;

  // Sektions-wrapper m. label, note, "gennemgået"-toggle.
  function Section({ k, label, title, note, children }) {
    return (
      <section style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={SECTION_LABEL}>{label}</div>
            <h2 style={H2}>{title}</h2>
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: done[k] ? "#197A66" : MUTED, cursor: "pointer", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} style={{ width: 17, height: 17 }} />
            Gennemgået
          </label>
        </div>
        {note && <Note>{note}</Note>}
        {children}
      </section>
    );
  }

  return (
    <main style={WRAP}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 18px" }}><Logo /></div>

      {/* Disclaimer B */}
      <div style={{ background: "#FBFCFD", border: "1px solid " + LINE, borderRadius: 12, padding: "13px 16px", color: MUTED, fontSize: 13, lineHeight: 1.55 }}>
        <b style={{ color: INK }}>Vigtigt:</b> Dette er et udkast, Birdly har lavet for at hjælpe dig i gang. Alt forudfyldt —
        også data fra offentlige registre — skal du tjekke, før du sender. Birdly giver ikke juridisk rådgivning,
        garanterer ikke at skabelonen dækker alle krav i netop dette udbud, og har intet ansvar for fejl, mangler eller
        udfald. Det fulde og bindende udbudsmateriale finder du hos ordregiveren.
      </div>

      {/* Lag 1 — intro */}
      <div style={{ ...CARD, background: "#F2FBF9", borderColor: "#BFE9E0" }}>
        <h1 style={{ ...H2, fontSize: 22 }}>Sådan bruger du skabelonen</h1>
        <p style={{ color: INK, lineHeight: 1.6, margin: "4px 0 10px" }}>
          Vi har gjort det meste klar for dig ud fra udbuddet og det, vi ved om din virksomhed.
        </p>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", lineHeight: 1.7, color: INK }}>
          <li>🟢 <b>Grønt = udfyldt af Birdly.</b> Læs igennem, og ret hvis noget ikke passer.</li>
          <li>🟡 <b>Gult = udfyld selv.</b> Det, kun du kender — fx din pris og dine referencer.</li>
        </ul>
        <p style={{ color: INK, lineHeight: 1.6, margin: "10px 0 0" }}>Følg trinene fra toppen. Til sidst gemmer du det hele som PDF.</p>
        <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: NAVY }}>{doneCount} af {CONTENT.length} sektioner gennemgået</div>
        <div style={{ height: 8, background: "#DCEFEA", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(doneCount / CONTENT.length) * 100}%`, background: TEAL, transition: "width .2s" }} />
        </div>
      </div>

      {/* Kom godt i gang */}
      <div style={CARD}>
        <div style={SECTION_LABEL}>Start her</div>
        <h2 style={H2}>Sådan kommer du i gang</h2>
        <ol style={{ paddingLeft: 20, lineHeight: 1.65, color: INK, margin: "8px 0 0" }}>
          <li style={{ marginBottom: 14 }}>
            <b>Hent udbudsmaterialet</b> — det fulde materiale (kravspecifikation, bilag, kontrakt) ligger hos ordregiveren.
            Opret en gratis konto, hent dokumenterne — det er også her, du sender dit tilbud til sidst.
            {n.submission_url && <div style={{ marginTop: 8 }}><a href={n.submission_url} target="_blank" rel="noopener noreferrer" style={BTN_PRIMARY}>Hent materiale &amp; opret konto →</a></div>}
            <div style={{ color: MUTED, fontSize: 12.5, marginTop: 6, fontStyle: "italic" }}>Det er gratis at oprette sig. Du skal alligevel bruge kontoen for at aflevere dit tilbud.</div>
          </li>
          <li style={{ marginBottom: 14 }}>
            <b>Læs udbuddet</b> på TED.
            {n.source_url && <div style={{ marginTop: 8 }}><a href={n.source_url} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Se hele udbuddet ↗</a></div>}
          </li>
          <li><b>Udfyld de gule felter</b> i skabelonen nedenfor, og gem som PDF.</li>
        </ol>
      </div>

      {/* Knap-række */}
      <div style={{ ...CARD, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {n.submission_url && <a href={n.submission_url} target="_blank" rel="noopener noreferrer" style={BTN_PRIMARY}>Hent materiale &amp; opret konto</a>}
        {n.source_url && <a href={n.source_url} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Se hele udbuddet</a>}
        {cvrLookup && <a href={cvrLookup} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Slå dit firma op</a>}
      </div>

      {/* 3. Overblik */}
      <Section k="overblik" label="Sektion 1" title="Overblik" note="Et hurtigt overblik over udbuddet — trukket direkte fra bekendtgørelsen.">
        <div><Chip kind="green" /></div>
        <div style={{ marginTop: 8 }}>
          <Row label="Udbud">{n.title || "—"}</Row>
          <Row label="Ordregiver">{n.buyer_name || "—"}</Row>
          <Row label="Frist">{fmtDate(n.deadline)}</Row>
          <Row label="Anslået beløb">{fmtBelob(n.amount, n.currency)}</Row>
          <Row label="Område">{n.cpv_main_name || n.cpv_main || "—"}</Row>
          <Row label="Geografi">{regionText(n)}</Row>
          {n.duration_text && <Row label="Varighed">{n.duration_text}</Row>}
          {n.suitable_for_sme === true && <Row label="SMV-egnet">Ja — egnet for små og mellemstore virksomheder</Row>}
        </div>
      </Section>

      {/* 4. Tilbudsbrev */}
      <Section k="tilbudsbrev" label="Sektion 2" title="Tilbudsbrev" note="Et kort følgebrev. Vi har sat dine stamdata ind — tjek at de passer.">
        <div style={{ marginBottom: 8 }}><Chip kind="green" /></div>
        <Row label="Virksomhed">{c.company_name || "—"}{c.cvr ? ` · CVR ${c.cvr}` : ""}</Row>
        <Row label="Vedrørende">{n.title || "—"}</Row>
        <p style={{ color: INK, lineHeight: 1.6, marginTop: 12 }}>
          Hermed afgiver {c.company_name || "vi"} tilbud på ovenstående udbud. Vi vedstår vores tilbud i den periode,
          udbudsmaterialet angiver, og accepterer udbuddets vilkår og betingelser.
        </p>
        <div style={{ marginTop: 10 }}>
          <label style={{ display: "block", fontSize: 13, color: MUTED, marginBottom: 5 }}>Kontaktperson hos jer <Chip kind="yellow" reason="Kun du kender den rigtige" /></label>
          <input style={INPUT} defaultValue={c.contact_name || ""} placeholder="Navn på jeres kontaktperson" />
        </div>
      </Section>

      {/* 5. ESPD */}
      <Section k="espd" label="Sektion 3" title="ESPD — standarderklæring" note="En standarderklæring om din virksomhed. Vi har sat svarene til det normale for en almindelig dansk virksomhed — tjek, at det passer for jer.">
        <div style={{ marginBottom: 10 }}><Chip kind="green" /></div>
        <p style={{ color: INK, lineHeight: 1.6, margin: "0 0 10px" }}>Bekræft, at ingen af disse udelukkelsesgrunde gælder din virksomhed (standard: <b>Nej</b> til alle):</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {EXCLUSION_GROUNDS.map((g, i) => (
            <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #F0F2F5", alignItems: "center" }}>
              <span style={{ color: INK, fontSize: 14.5 }}>{g}</span>
              <span style={{ flex: "0 0 auto", fontWeight: 700, color: "#197A66" }}>Nej</span>
            </li>
          ))}
        </ul>
        <p style={{ color: MUTED, fontSize: 12.5, marginTop: 10, fontStyle: "italic" }}>Selve ESPD-erklæringen udfyldes elektronisk i ordregiverens udbudssystem (samme sted, du henter materialet).</p>
      </Section>

      {/* 6. Referencer */}
      <Section k="referencer" label="Sektion 4" title="Referencer" note="Udbuddet beder typisk om et antal lignende opgaver. Vælg dem, der ligner denne opgave mest. Det præcise antal står i udbudsmaterialet.">
        <div style={{ marginBottom: 8 }}><Chip kind="yellow" reason="Kun du kender jeres opgaver" /></div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, color: MUTED, marginBottom: 5 }}>Reference {i}</label>
            <textarea style={{ ...INPUT, minHeight: 64, resize: "vertical" }} placeholder="Kunde · opgave · værdi · årstal · kort beskrivelse" />
          </div>
        ))}
      </Section>

      {/* 7. Pris */}
      <Section k="pris" label="Sektion 5" title="Pris" note={<>Skriv din samlede pris. Vigtigt: et tilbud over budgetloftet bliver afvist.{n.amount != null ? ` Udbuddets anslåede beløb: ${fmtBelob(n.amount, n.currency)}.` : ""}</>}>
        {n.amount != null && (
          <div style={{ background: "#FFF6E9", border: "1px solid #F3D9A8", borderRadius: 10, padding: "10px 12px", marginBottom: 12, color: "#92670A", fontSize: 13.5 }}>
            Anslået/forventet beløb i udbuddet: <b>{fmtBelob(n.amount, n.currency)}</b>
          </div>
        )}
        <label style={{ display: "block", fontSize: 13, color: MUTED, marginBottom: 5 }}>Din samlede tilbudspris <Chip kind="yellow" reason="Kun du kender din pris" /></label>
        <input style={INPUT} inputMode="numeric" placeholder="fx 1.250.000 DKK" />
        <p style={{ color: MUTED, fontSize: 12.5, marginTop: 8, fontStyle: "italic" }}>Birdly rører aldrig din pris — den taster du selv.</p>
      </Section>

      {/* 8. Kvalitet */}
      <Section k="kvalitet" label="Sektion 6" title="Kvalitet" note="Det er her, du vinder opgaven. Vær konkret om jeres erfaring med netop denne type arbejde. Tildelingskriteriernes vægtning står i udbudsmaterialet.">
        <div style={{ marginBottom: 8 }}><Chip kind="yellow" reason="Jeres substans og erfaring" /></div>
        <textarea style={{ ...INPUT, minHeight: 120, resize: "vertical" }} placeholder="Beskriv jeres faglige kvalifikationer, erfaring og tilgang til opgaven …" />
      </Section>

      {/* 9. Formalia */}
      <Section k="formalia" label="Sektion 7" title="Formalia-tjekliste" note="Det praktiske, så dit tilbud bliver gyldigt. Tjek listen af, før du sender.">
        <div style={{ marginBottom: 8 }}><Chip kind="green" /></div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <Check>Tilbud afgivet inden fristen: <b>{fmtDate(n.deadline)}</b></Check>
          <Check>Tilbud afleveret elektronisk i ordregiverens udbudssystem</Check>
          <Check>ESPD-erklæring udfyldt og vedlagt</Check>
          <Check>Alle krævede bilag og erklæringer vedlagt (se udbudsmaterialet)</Check>
          <Check>Tilbuddet er på dansk (medmindre andet er angivet)</Check>
        </ul>
      </Section>

      <p style={{ textAlign: "center", color: MUTED, fontSize: 12.5, marginTop: 20 }}>
        Skabelonen er et hjælpeværktøj — det bindende materiale ligger hos ordregiveren. · Gem som PDF kommer i et senere trin.
      </p>
    </main>
  );
}

function Check({ children }) {
  return (
    <li style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #F0F2F5", alignItems: "flex-start", color: "#41505E", fontSize: 14.5, lineHeight: 1.5 }}>
      <span aria-hidden style={{ flex: "0 0 auto", color: "#1E9E8A", fontWeight: 700 }}>☐</span>
      <span>{children}</span>
    </li>
  );
}
