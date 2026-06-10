"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import { uploadTenderFile, deleteTenderFile } from "../lib/share";

// Bud-skabelon (Fase D / stop-point #2: tre-tilstands-markering + sektionsstruktur).
// ALT forudfyldt læses dynamisk per udbud fra get-shared-notice — intet hardkodes,
// intet kopieres mellem udbud. Kan vi ikke læse en værdi pålideligt → 🟡 "tjek i
// udbudsmaterialet" + note, aldrig et gæt. Upload (#3), pris-modeller (#4) og PDF (#5)
// foldes ind i senere trin. Mobil-først, noindex (sættes i page.js).

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
const LBL = { display: "block", fontSize: 13, color: MUTED, marginBottom: 5 };

// Print-stylesheet: skjul UI-chrome (knapper, upload-felter, "gennemgået", progress,
// samtykke-boksen selv) og rens felterne, så "Gem som PDF" giver et pænt dokument.
const PRINT_CSS = `
@media screen { .print-only { display: none !important; } }
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { background: #fff !important; }
  input, textarea, select { border: 1px solid #D7DCE2 !important; box-shadow: none !important; color: #1B2733 !important; }
  textarea { height: auto !important; min-height: 0 !important; overflow: visible !important; }
  section, .skab-card { box-shadow: none !important; break-inside: avoid; }
  @page { margin: 15mm; }
}`;

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("da-DK", { dateStyle: "long" });
}
function fmtKr(amount, currency) {
  if (amount == null) return "Ikke oplyst i bekendtgørelsen";
  return new Intl.NumberFormat("da-DK").format(Math.round(amount)) + (currency ? " " + currency : "");
}
function regionText(n) {
  if (n?.nationwide) return "Hele landet";
  if (Array.isArray(n?.nuts_codes) && n.nuts_codes.length) return n.nuts_codes.join(", ");
  return "—";
}

// Tre-tilstands-chip. green = forudfyldt fra bekendtgørelsen; amber = vigtigt men ikke
// pålideligt parsebart (tjek i materialet); blue = kun kunden kender svaret.
const STATES = {
  green: { bg: "#E5F7EF", fg: "#197A66", icon: "🟢", text: "Udfyldt af Birdly — tjek efter" },
  amber: { bg: "#FDF3DC", fg: "#92670A", icon: "🟡", text: "Tjek i udbudsmaterialet" },
  blue: { bg: "#E7F1FE", fg: "#1366A6", icon: "🔵", text: "Udfyld selv" },
};
function Chip({ state, reason }) {
  const s = STATES[state] || STATES.blue;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", background: s.bg, color: s.fg }}>
      <span aria-hidden>{s.icon}</span>{s.text}{reason ? <span style={{ fontWeight: 400 }}>· {reason}</span> : null}
    </span>
  );
}
function Note({ children }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "#F6F8FA", border: "1px solid " + LINE, borderRadius: 10, padding: "10px 12px", margin: "10px 0 14px", color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>
      <span aria-hidden style={{ flex: "0 0 auto", marginTop: 1 }}>💡</span><em style={{ fontStyle: "italic" }}>{children}</em>
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
// Lille gul boks der fortæller hvad kunden skal finde i materialet (amber-tilstand).
function CheckInMaterial({ children }) {
  return (
    <div style={{ background: "#FFF6E9", border: "1px solid #F3D9A8", borderRadius: 10, padding: "10px 12px", color: "#92670A", fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>{children}</div>
  );
}
function fmtBytes(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return Math.round(b / 1024) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}
const emailOk = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Fil-upload pr. sektion. Privat bucket via Edge Function; server-side type+10MB-check.
function FileUpload({ token, section, initial }) {
  const [files, setFiles] = useState(initial || []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function onPick(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true); setErr("");
    try { const row = await uploadTenderFile(token, section, f); setFiles((x) => [...x, row]); }
    catch (ex) { setErr(ex.message || "Upload fejlede."); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    setErr("");
    try { await deleteTenderFile(token, id); setFiles((x) => x.filter((f) => f.id !== id)); }
    catch (ex) { setErr(ex.message || "Kunne ikke slette."); }
  }
  return (
    <div style={{ marginTop: 10 }}>
      <label className="no-print" style={{ ...BTN_OUTLINE, display: "inline-block", cursor: "pointer" }}>
        {busy ? "Uploader …" : "📎 Vedhæft fil"}
        <input type="file" accept=".pdf,.docx,.xlsx,.doc,.xls,.jpg,.jpeg,.png" onChange={onPick} disabled={busy} style={{ display: "none" }} />
      </label>
      <span className="no-print" style={{ color: MUTED, fontSize: 12, marginLeft: 10 }}>pdf, docx, xlsx, jpg, png · maks 10 MB</span>
      {err && <div style={{ color: "#B3261E", fontSize: 13, marginTop: 6 }}>{err}</div>}
      {files.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
          {files.map((f) => (
            <li key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 11px", background: "#F6F8FA", border: "1px solid " + LINE, borderRadius: 9, marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {f.file_name} <span style={{ color: MUTED }}>{f.size_bytes ? "· " + fmtBytes(f.size_bytes) : ""}</span></span>
              <button onClick={() => remove(f.id)} aria-label="Fjern fil" style={{ border: 0, background: "none", color: MUTED, cursor: "pointer", fontSize: 16, flex: "0 0 auto" }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Valgfri pris-tabel (hjælperedskab — erstatter ALDRIG ordregiverens tilbudsliste).
// Post · Mængde · Enhedspris · Beløb (auto = mængde×enhedspris) + autosum.
function PriceTable() {
  const [rows, setRows] = useState([{ post: "", qty: "", unit: "" }]);
  const num = (v) => { const x = Number(String(v).replace(/\./g, "").replace(",", ".")); return Number.isFinite(x) ? x : 0; };
  const amount = (r) => num(r.qty) * num(r.unit);
  const total = rows.reduce((s, r) => s + amount(r), 0);
  const set = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const cell = { padding: "4px" };
  const inp = { ...INPUT, padding: "8px 10px" };
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 470 }}>
          <thead><tr style={{ color: MUTED, textAlign: "left" }}><th style={cell}>Post</th><th style={{ ...cell, width: 80 }}>Mængde</th><th style={{ ...cell, width: 110 }}>Enhedspris</th><th style={{ ...cell, width: 110, textAlign: "right" }}>Beløb</th><th /></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={cell}><input value={r.post} onChange={(e) => set(i, "post", e.target.value)} style={inp} placeholder="Beskrivelse" /></td>
                <td style={cell}><input value={r.qty} onChange={(e) => set(i, "qty", e.target.value)} inputMode="decimal" style={inp} /></td>
                <td style={cell}><input value={r.unit} onChange={(e) => set(i, "unit", e.target.value)} inputMode="decimal" style={inp} /></td>
                <td style={{ ...cell, textAlign: "right", fontWeight: 600, color: NAVY }}>{new Intl.NumberFormat("da-DK").format(Math.round(amount(r)))}</td>
                <td style={cell}>{rows.length > 1 && <button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} aria-label="Fjern række" style={{ border: 0, background: "none", color: MUTED, cursor: "pointer" }}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setRows((rs) => [...rs, { post: "", qty: "", unit: "" }])} style={BTN_OUTLINE}>+ Tilføj række</button>
        <div style={{ fontWeight: 700, color: NAVY }}>Sum: {new Intl.NumberFormat("da-DK").format(Math.round(total))} DKK</div>
      </div>
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
  const CONTENT = ["resume", "formalia", "espd", "pris", "kvalitet", "erklaeringer", "kontrakt"];
  const [done, setDone] = useState({});
  const doneCount = CONTENT.filter((k) => done[k]).length;
  const toggle = (k) => setDone((s) => ({ ...s, [k]: !s[k] }));

  const cust = (data && data.customer) || {};
  const [contact, setContact] = useState({ name: cust.contact_name || "", phone: cust.phone || "", email: cust.email || "", dept: "" });
  const [bidMode, setBidMode] = useState("alene"); // alene | konsortium
  const [relyCapacity, setRelyCapacity] = useState(false); // baserer sig på andres kapacitet
  const [consent, setConsent] = useState(false);

  if (!data || !data.found) {
    return (
      <main style={{ ...WRAP, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 28px" }}><Logo /></div>
        <div style={CARD}><h1 style={H2}>Linket er ugyldigt eller udløbet</h1><p style={{ color: MUTED }}>Vi kunne ikke finde udbuddet bag dette link.</p></div>
      </main>
    );
  }

  const n = data.notice || {};
  const c = data.customer || {};
  const allFiles = Array.isArray(data.files) ? data.files : [];
  const filesFor = (sec) => allFiles.filter((f) => f.section === sec);
  const cvrLookup = c.cvr ? `https://datacvr.virk.dk/enhed/virksomhed/${encodeURIComponent(c.cvr)}` : null;
  const award = Array.isArray(n.award_criteria) ? n.award_criteria : [];
  const priceCrit = award.find((a) => a.type === "price");
  const qualCrits = award.filter((a) => a.type !== "price");
  const onlyPrice = award.length > 0 && qualCrits.length === 0; // laveste pris → nedton kvalitet
  const selection = Array.isArray(n.selection_criteria) ? n.selection_criteria : [];
  const lots = Array.isArray(n.lots) ? n.lots : [];
  const mailto = n.contact_email ? `mailto:${n.contact_email}?subject=${encodeURIComponent("Spørgsmål: " + (n.title || "udbud"))}` : null;

  function Section({ k, label, title, note, children }) {
    return (
      <section style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div><div style={SECTION_LABEL}>{label}</div><h2 style={H2}>{title}</h2></div>
          <label className="no-print" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: done[k] ? "#197A66" : MUTED, cursor: "pointer", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} style={{ width: 17, height: 17 }} /> Gennemgået
          </label>
        </div>
        {note && <Note>{note}</Note>}
        {children}
      </section>
    );
  }

  return (
    <main style={WRAP}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 18px" }}><Logo /></div>

      {/* Print-header (kun i PDF) */}
      <div className="print-only" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>Tilbudsudkast — {n.title || "udbud"}</div>
        <div style={{ color: MUTED, fontSize: 13 }}>{c.company_name || ""}{c.cvr ? ` · CVR ${c.cvr}` : ""} · Ordregiver: {n.buyer_name || "—"} · Frist: {fmtDate(n.deadline)}</div>
      </div>

      {/* Disclaimer B */}
      <div style={{ background: "#FBFCFD", border: "1px solid " + LINE, borderRadius: 12, padding: "13px 16px", color: MUTED, fontSize: 13, lineHeight: 1.55 }}>
        <b style={{ color: INK }}>Vigtigt:</b> Dette er et udkast, Birdly har lavet for at hjælpe dig i gang. Alt forudfyldt —
        også data fra offentlige registre — skal du tjekke, før du sender. Birdly giver ikke juridisk rådgivning,
        garanterer ikke at skabelonen dækker alle krav i netop dette udbud, og har intet ansvar for fejl, mangler eller
        udfald. Det fulde og bindende udbudsmateriale finder du hos ordregiveren.
      </div>

      {/* Lag 1 — intro m. tre tilstande + fremskridt */}
      <div style={{ ...CARD, background: "#F2FBF9", borderColor: "#BFE9E0" }}>
        <h1 style={{ ...H2, fontSize: 22 }}>Sådan bruger du skabelonen</h1>
        <p style={{ color: INK, lineHeight: 1.6, margin: "4px 0 10px" }}>Vi har gjort det meste klar for dig ud fra udbuddet og det, vi ved om din virksomhed. Hvert felt er mærket:</p>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", lineHeight: 1.8, color: INK }}>
          <li>🟢 <b>Udfyldt af Birdly.</b> Læs igennem, og ret hvis noget ikke passer.</li>
          <li>🟡 <b>Tjek i udbudsmaterialet.</b> Vigtigt — men det kan vi ikke læse sikkert fra bekendtgørelsen. Find det i materialet hos ordregiveren.</li>
          <li>🔵 <b>Udfyld selv.</b> Det, kun du kender — fx din pris og dine referencer.</li>
        </ul>
        <p style={{ color: INK, lineHeight: 1.6, margin: "10px 0 0" }}>Følg trinene fra toppen. Til sidst gemmer du det hele som PDF.</p>
        <div className="no-print" style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: NAVY }}>{doneCount} af {CONTENT.length} sektioner gennemgået</div>
        <div className="no-print" style={{ height: 8, background: "#DCEFEA", borderRadius: 999, marginTop: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${(doneCount / CONTENT.length) * 100}%`, background: TEAL, transition: "width .2s" }} /></div>
      </div>

      {/* Kom godt i gang + knap-række */}
      <div className="no-print" style={CARD}>
        <div style={SECTION_LABEL}>Start her</div>
        <h2 style={H2}>Sådan kommer du i gang</h2>
        <ol style={{ paddingLeft: 20, lineHeight: 1.65, color: INK, margin: "8px 0 0" }}>
          <li style={{ marginBottom: 14 }}>
            <b>Hent udbudsdokumenterne</b> — det fulde materiale (kravspecifikation, bilag, kontrakt, tilbudsliste) ligger hos ordregiveren.
            {n.submission_url && <div style={{ marginTop: 8 }}><a href={n.submission_url} target="_blank" rel="noopener noreferrer" style={BTN_PRIMARY}>Hent udbudsdokumenter →</a></div>}
            <div style={{ color: MUTED, fontSize: 12.5, marginTop: 6, fontStyle: "italic" }}>Tryk "Offentligt udbudsmateriale" / "Hent dokumenter" på siden. Du skal måske oprette en gratis konto — det bestemmer ordregiveren. Du skal alligevel bruge kontoen for at aflevere dit tilbud.</div>
          </li>
          <li style={{ marginBottom: 14 }}><b>Læs udbuddet</b> på TED.{n.source_url && <div style={{ marginTop: 8 }}><a href={n.source_url} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Se hele udbuddet ↗</a></div>}</li>
          <li><b>Gennemgå skabelonen</b> nedenfor — ret de grønne, find de gule i materialet, udfyld de blå.</li>
        </ol>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, borderTop: "1px solid #F0F2F5", paddingTop: 16 }}>
          {n.submission_url && <a href={n.submission_url} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Hent udbudsdokumenter</a>}
          {n.source_url && <a href={n.source_url} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Se hele udbuddet</a>}
          {cvrLookup && <a href={cvrLookup} target="_blank" rel="noopener noreferrer" style={BTN_OUTLINE}>Slå dit firma op</a>}
          {mailto && <a href={mailto} style={BTN_OUTLINE}>Kontakt ordregiver</a>}
        </div>
      </div>

      {/* 0. Resumé */}
      <Section k="resume" label="Sektion 0" title="Resumé" note="Et hurtigt overblik — trukket direkte fra bekendtgørelsen.">
        <div style={{ marginBottom: 8 }}><Chip state="green" /></div>
        <Row label="Udbud">{n.title || "—"}</Row>
        <Row label="Ordregiver">{n.buyer_name || "—"}{n.contact_person ? <span style={{ fontWeight: 400, color: MUTED }}> · {n.contact_person}{n.contact_email ? ` (${n.contact_email})` : ""}</span> : null}</Row>
        <Row label="Frist">{fmtDate(n.deadline)}</Row>
        <Row label="Anslået værdi">{fmtKr(n.amount, n.currency)}</Row>
        <Row label="Område">{n.cpv_main_name || n.cpv_main || "—"}</Row>
        <Row label="Geografi">{regionText(n)}</Row>
        {n.duration_text && <Row label="Varighed">{n.duration_text}</Row>}
        <Row label="Delaftaler">{lots.length > 1 ? `${lots.length} delaftaler` : "Én samlet aftale"}</Row>
        {award.length > 0 && <Row label="Tildeling">{award.map((a) => `${a.name || a.type}${a.weight != null ? " " + a.weight + "%" : ""}`).join(" · ")}</Row>}
        {n.suitable_for_sme === true && <Row label="SMV-egnet">Ja — egnet for små og mellemstore virksomheder</Row>}
        {lots.length > 1 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 6 }}>Delaftaler</div>
            {lots.map((l, i) => <div key={i} style={{ color: INK, fontSize: 14, padding: "4px 0" }}>• {l.title || l.id || `Delaftale ${i + 1}`}{l.cpv_main ? ` · CPV ${l.cpv_main}` : ""}{l.amount != null ? ` · ${fmtKr(l.amount, l.currency)}` : ""}</div>)}
          </div>
        )}
      </Section>

      {/* 2. Formalia & tjekliste */}
      <Section k="formalia" label="Sektion 1" title="Formalia & tjekliste" note="Det praktiske, så dit tilbud bliver gyldigt. De grønne er sikre; de gule skal du bekræfte i materialet.">
        <Row label="Frist"><span>{fmtDate(n.deadline)}</span> <span style={{ marginLeft: 8 }}><Chip state="green" /></span></Row>
        <Row label="Afleveres via">{n.submission_url ? "Ordregiverens udbudssystem (elektronisk)" : "Se udbudsmaterialet"} <span style={{ marginLeft: 8 }}><Chip state={n.submission_url ? "green" : "amber"} /></span></Row>
        <Row label="Sprog"><Chip state="amber" /></Row>
        <Row label="Format & vedståelse"><Chip state="amber" /></Row>
        <CheckInMaterial>Sprog, afleveringsformat og vedståelsesperiode står i udbudsbetingelserne — tjek dem, før du sender.</CheckInMaterial>

        {/* Betingelser der styrer tjeklisten + erklæringer */}
        <div style={{ background: "#F6F8FA", border: "1px solid " + LINE, borderRadius: 10, padding: "12px 14px", marginTop: 14 }}>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>Hvordan byder du?</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", gap: 7, alignItems: "center", cursor: "pointer", color: INK }}><input type="radio" name="bidmode" checked={bidMode === "alene"} onChange={() => setBidMode("alene")} /> Jeg byder alene</label>
            <label style={{ display: "inline-flex", gap: 7, alignItems: "center", cursor: "pointer", color: INK }}><input type="radio" name="bidmode" checked={bidMode === "konsortium"} onChange={() => setBidMode("konsortium")} /> Vi byder i konsortium</label>
          </div>
          <label style={{ display: "inline-flex", gap: 7, alignItems: "flex-start", cursor: "pointer", color: INK, marginTop: 10 }}><input type="checkbox" checked={relyCapacity} onChange={(e) => setRelyCapacity(e.target.checked)} style={{ marginTop: 3 }} /> Jeg baserer mig på andres økonomiske eller tekniske kapacitet (fx en underleverandør)</label>
        </div>

        <div style={{ fontWeight: 700, color: NAVY, margin: "16px 0 4px" }}>Påkrævet <span style={{ fontWeight: 400, color: MUTED, fontSize: 13 }}>— uden disse afvises tilbuddet</span></div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <Check>Tilbud afgivet inden fristen: <b>{fmtDate(n.deadline)}</b></Check>
          <Check>Tilbud afleveret elektronisk i ordregiverens udbudssystem</Check>
          <Check>Korrekt sprog (se udbudsbetingelser)</Check>
          <Check>ESPD udfyldt og vedlagt</Check>
          <Check>Komplet, udfyldt tilbudsliste vedlagt (ordregiverens format)</Check>
          {selection.length > 0 && <Check>Referencer iht. udbuddets mindstekrav</Check>}
        </ul>

        {(bidMode === "konsortium" || relyCapacity) && (
          <>
            <div style={{ fontWeight: 700, color: NAVY, margin: "14px 0 4px" }}>Påkrævet for dig <span style={{ fontWeight: 400, color: MUTED, fontSize: 13 }}>— ud fra dine valg ovenfor</span></div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {bidMode === "konsortium" && <Check>Konsortieerklæring (alle deltagere hæfter solidarisk)</Check>}
              {relyCapacity && <Check>Støtteerklæring fra den/de virksomhed(er), du baserer dig på</Check>}
            </ul>
          </>
        )}

        <div style={{ fontWeight: 700, color: NAVY, margin: "14px 0 4px" }}>Anbefalet <span style={{ fontWeight: 400, color: MUTED, fontSize: 13 }}>— styrker tilbuddet</span></div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <Check>Kort følgebrev</Check>
          <Check>Ingen forbehold over for udbudsmaterialet</Check>
        </ul>
      </Section>

      {/* 3. ESPD */}
      <Section k="espd" label="Sektion 2" title="ESPD — standarderklæring" note="En standarderklæring om din virksomhed. Vi har sat svarene til det normale for en almindelig dansk virksomhed — tjek, at det passer for jer.">
        <Row label="Virksomhed">{c.company_name || "—"}{c.cvr ? ` · CVR ${c.cvr}` : ""} <span style={{ marginLeft: 8 }}><Chip state="green" /></span></Row>

        <div style={{ fontWeight: 700, color: NAVY, margin: "14px 0 6px" }}>Jeres kontaktperson <span style={{ marginLeft: 8 }}><Chip state={contact.name || contact.email ? "green" : "blue"} reason="Udfyld det vi mangler" /></span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={LBL}>Navn</label><input style={INPUT} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Fulde navn" /></div>
          <div><label style={LBL}>Afdeling (valgfri)</label><input style={INPUT} value={contact.dept} onChange={(e) => setContact({ ...contact, dept: e.target.value })} placeholder="fx Indkøb" /></div>
          <div><label style={LBL}>Telefon</label><input style={INPUT} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} inputMode="tel" placeholder="+45 …" /></div>
          <div>
            <label style={LBL}>E-mail</label>
            <input style={{ ...INPUT, borderColor: emailOk(contact.email) ? LINE : "#E0A800" }} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} inputMode="email" placeholder="navn@firma.dk" />
            {!emailOk(contact.email) && <div style={{ color: "#92670A", fontSize: 12, marginTop: 4 }}>Ser ikke ud som en e-mail — tjek lige.</div>}
          </div>
        </div>

        <div style={{ fontWeight: 700, color: NAVY, margin: "16px 0 6px" }}>Udelukkelsesgrunde <span style={{ marginLeft: 8 }}><Chip state="green" /></span></div>
        <p style={{ color: INK, lineHeight: 1.6, margin: "0 0 10px" }}>Bekræft, at ingen af disse gælder din virksomhed (standard: <b>Nej</b> til alle):</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {EXCLUSION_GROUNDS.map((g, i) => (
            <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #F0F2F5", alignItems: "center" }}>
              <span style={{ color: INK, fontSize: 14.5 }}>{g}</span><span style={{ flex: "0 0 auto", fontWeight: 700, color: "#197A66" }}>Nej</span>
            </li>
          ))}
        </ul>
        <div style={{ fontWeight: 700, color: NAVY, margin: "16px 0 6px" }}>Mindstekrav til egnethed <span style={{ marginLeft: 8 }}><Chip state={selection.length ? "green" : "amber"} reason={selection.length ? "fra bekendtgørelsen" : null} /></span></div>
        {selection.length > 0 ? (
          <>
            {selection.map((s, i) => <div key={i} style={{ color: INK, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", paddingBottom: 6 }}>{s.description || s.type}</div>)}
            <CheckInMaterial>Det præcise antal referencer, omsætningskrav og andre mindstekrav står i udbudsbetingelserne — bekræft dem dér.</CheckInMaterial>
          </>
        ) : (
          <CheckInMaterial>Mindstekrav til egnethed (fx omsætning, referencer) står i udbudsbetingelserne — vi kan ikke læse dem sikkert fra bekendtgørelsen.</CheckInMaterial>
        )}
        <div style={{ fontWeight: 700, color: NAVY, margin: "16px 0 6px" }}>Referencer <span style={{ marginLeft: 8 }}><Chip state="blue" reason="Kun du kender jeres opgaver" /></span></div>
        <p style={{ color: MUTED, fontSize: 13, margin: "0 0 8px" }}>Beskriv lignende opgaver — og vedhæft evt. dokumentation.</p>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <label style={LBL}>Reference {i}</label>
            <textarea style={{ ...INPUT, minHeight: 60, resize: "vertical" }} placeholder="Kunde · opgave · værdi · årstal · kort beskrivelse" />
          </div>
        ))}
        <FileUpload token={token} section="referencer" initial={filesFor("referencer")} />
      </Section>

      {/* 4. Tilbudsliste / Pris */}
      <Section k="pris" label="Sektion 3" title="Tilbudsliste / Pris" note="Prisen afleveres næsten altid i ordregiverens egen tilbudsliste. Vi viser ALDRIG en standard-liste — hent ordregiverens, udfyld den, og læg den ved.">
        <div style={{ marginBottom: 8 }}><Chip state="amber" /></div>
        <CheckInMaterial>Hent ordregiverens tilbudsliste i materialet og udfyld den i deres format — det er den, der skal afleveres.{n.amount != null ? ` Anslået værdi i udbuddet: ${fmtKr(n.amount, n.currency)}${priceCrit ? ` · Pris vægter ${priceCrit.weight}%.` : "."}` : ""}</CheckInMaterial>

        <div style={{ fontWeight: 700, color: NAVY, marginTop: 16 }}>1 · Upload udfyldt prisbilag <span style={{ marginLeft: 6 }}><Chip state="blue" reason="Ordregiverens egen tilbudsliste — det vigtigste" /></span></div>
        <p style={{ color: MUTED, fontSize: 13, margin: "4px 0 0" }}>Hent ordregiverens tilbudsliste (Excel/PDF) i materialet, udfyld den, og læg den her. Den skal afleveres i ordregiverens eget format.</p>
        <FileUpload token={token} section="pris" initial={filesFor("pris")} />

        <div style={{ fontWeight: 700, color: NAVY, marginTop: 18 }}>2 · Samlet tilbudspris <span style={{ marginLeft: 6 }}><Chip state="blue" reason="Kun du kender din pris" /></span></div>
        <input style={{ ...INPUT, marginTop: 8 }} inputMode="numeric" placeholder="fx 1.250.000 DKK" />

        <div style={{ fontWeight: 700, color: NAVY, marginTop: 18 }}>3 · Valgfri pris-tabel <span style={{ marginLeft: 6 }}><Chip state="blue" reason="Til dine egne beregninger" /></span></div>
        <div style={{ background: "#FFF6E9", border: "1px solid #F3D9A8", borderRadius: 10, padding: "9px 12px", marginTop: 8, color: "#92670A", fontSize: 13 }}>Kun et hjælperedskab til dine egne beregninger — den <b>erstatter ikke</b> ordregiverens tilbudsliste, som stadig skal udfyldes og uploades ovenfor.</div>
        <PriceTable />
        <p style={{ color: MUTED, fontSize: 12.5, marginTop: 10, fontStyle: "italic" }}>Birdly rører aldrig tallene — alt indtastes/uploades af dig.</p>
      </Section>

      {/* 5. Tilbudsbeskrivelse (kvalitet) */}
      {!onlyPrice && (
        <Section k="kvalitet" label="Sektion 4" title="Tilbudsbeskrivelse (kvalitet)" note="Det er her, du vinder opgaven. Vær konkret om jeres erfaring med netop denne type arbejde.">
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 6 }}>Kvalitetskriterier <span style={{ marginLeft: 8 }}><Chip state={qualCrits.length ? "green" : "amber"} reason={qualCrits.length ? "fra bekendtgørelsen" : null} /></span></div>
          {qualCrits.length > 0 ? (
            <div style={{ marginBottom: 8 }}>{qualCrits.map((q, i) => <div key={i} style={{ color: INK, fontSize: 14, padding: "3px 0" }}>• {q.name || "Kvalitet"}{q.weight != null ? ` — vægter ${q.weight}%` : ""}</div>)}</div>
          ) : (
            <CheckInMaterial>Kvalitetskriterierne og deres vægtning står i udbudsbetingelserne.</CheckInMaterial>
          )}
          <CheckInMaterial>Selve evalueringsmetoden og hvad der præcist skal beskrives under hvert kriterium står i udbudsbetingelserne.</CheckInMaterial>
          <div style={{ marginTop: 12 }}>
            <label style={LBL}>Jeres beskrivelse <span style={{ marginLeft: 6 }}><Chip state="blue" reason="Jeres substans og erfaring" /></span></label>
            <textarea style={{ ...INPUT, minHeight: 110, resize: "vertical" }} placeholder="Beskriv jeres faglige kvalifikationer, erfaring og tilgang …" />
          </div>
          <FileUpload token={token} section="kvalitet" initial={filesFor("kvalitet")} />
        </Section>
      )}
      {onlyPrice && (
        <Section k="kvalitet" label="Sektion 4" title="Tilbudsbeskrivelse (kvalitet)" note="Dette udbud tildeles på laveste pris — kvalitet vægter ikke. Sørg blot for at opfylde mindstekravene.">
          <div><Chip state="amber" /></div>
        </Section>
      )}

      {/* 6. Erklæringer (betinget af valgene i tjeklisten) */}
      <Section k="erklaeringer" label="Sektion 5" title="Erklæringer" note="Vi viser kun de erklæringer, der er relevante ud fra dine valg under 'Hvordan byder du?' i Formalia-sektionen.">
        <div style={{ marginBottom: 10 }}><Chip state="blue" reason="Udfyldes + underskrives af dig" /></div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ padding: "10px 0", borderBottom: "1px solid #F0F2F5" }}>
            <div style={{ fontWeight: 700, color: NAVY }}>Sanktionserklæring (Rusland, art. 5k)</div>
            <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>Bekræfter at virksomheden ikke er omfattet af de russiske sanktioner. Kræves i stort set alle EU-udbud.</div>
          </li>
          {bidMode === "konsortium" && (
            <li style={{ padding: "10px 0", borderBottom: "1px solid #F0F2F5" }}>
              <div style={{ fontWeight: 700, color: NAVY }}>Konsortieerklæring</div>
              <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>Alle konsortiedeltagere hæfter solidarisk og udpeger en fælles befuldmægtiget.</div>
            </li>
          )}
          {relyCapacity && (
            <li style={{ padding: "10px 0", borderBottom: "1px solid #F0F2F5" }}>
              <div style={{ fontWeight: 700, color: NAVY }}>Støtteerklæring</div>
              <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>Den virksomhed, du baserer dig på, forpligter sig til at stille sin kapacitet til rådighed for kontrakten.</div>
            </li>
          )}
        </ul>
        {bidMode === "alene" && !relyCapacity && (
          <p style={{ color: MUTED, fontSize: 13, fontStyle: "italic", marginTop: 10 }}>Du byder alene og baserer dig ikke på andre — så konsortie- og støtteerklæring er ikke relevant for dig.</p>
        )}
        <CheckInMaterial>Den præcise ordlyd og evt. ordregiver-skabeloner for erklæringerne ligger i udbudsmaterialet. Hent dem, udfyld, underskriv — og vedhæft dem her.</CheckInMaterial>
        <FileUpload token={token} section="erklaeringer" initial={filesFor("erklaeringer")} />
      </Section>

      {/* 7. Kontraktvilkår */}
      <Section k="kontrakt" label="Sektion 6" title="Kontraktvilkår (orientering)" note="Et overblik — de bindende vilkår står i kontraktudkastet.">
        <div style={{ marginBottom: 8 }}><Chip state="amber" /></div>
        <CheckInMaterial>Standardkontrakt, betalingsvilkår, bod, ansvar og øvrige væsentlige vilkår står i kontraktudkastet i materialet. Ved at afgive tilbud accepterer du vilkårene.</CheckInMaterial>
      </Section>

      {/* Samtykke-boks + PDF (skjult i selve PDF'en) */}
      <div className="no-print" style={{ ...CARD, background: "#F2FBF9", borderColor: "#BFE9E0" }}>
        <p style={{ color: INK, lineHeight: 1.6, margin: "0 0 12px" }}>
          Vi har hjulpet dig så langt, vi kan. Resten — og ansvaret for, at tilbuddet er korrekt og fuldstændigt — ligger
          hos dig som tilbudsgiver. Sæt kryds for at bekræfte, før du gemmer.
        </p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", color: INK, fontSize: 13.5, lineHeight: 1.55 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, flex: "0 0 auto" }} />
          <span>
            Jeg er indforstået med, at denne skabelon alene er et vejledende hjælpeværktøj fra Birdly, der skal gøre det lettere
            at komme i gang med at afgive tilbud. Skabelonen er udarbejdet på grundlag af de offentligt tilgængelige oplysninger
            i udbudsbekendtgørelsen og erstatter ikke det fulde, bindende udbudsmateriale, som ordregiveren stiller til rådighed.
            Det er alene mit ansvar som tilbudsgiver at sikre, at mit tilbud er korrekt og fuldstændigt og opfylder samtlige krav
            i udbuddet — herunder krav, som Birdly ikke har kendskab til. Birdly fraskriver sig ethvert ansvar for oplysningernes
            rigtighed og for tilbuddets gyldighed eller udfald.
          </span>
        </label>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => { if (consent) window.print(); }}
            disabled={!consent}
            style={{ ...(consent ? BTN_PRIMARY : { ...BTN_PRIMARY, background: "#C7D0D8", cursor: "not-allowed" }), border: 0, fontSize: 16, padding: "14px 24px" }}
          >
            Gem som PDF
          </button>
          {!consent && <span style={{ color: MUTED, fontSize: 13, marginLeft: 12 }}>Sæt kryds ovenfor for at låse op.</span>}
          <p style={{ color: MUTED, fontSize: 12.5, marginTop: 10, fontStyle: "italic" }}>Vælg "Gem som PDF" i print-dialogen. Vedhæftede dokumentfiler følger med som navne — selve filerne uploader du i udbudssystemet.</p>
        </div>
      </div>

      {/* Samtykke-linje der følger med i PDF'en */}
      <div className="print-only" style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid " + LINE, color: MUTED, fontSize: 11.5, lineHeight: 1.5 }}>
        Dette udkast er et vejledende hjælpeværktøj fra Birdly, udarbejdet på grundlag af de offentligt tilgængelige oplysninger
        i udbudsbekendtgørelsen. Det erstatter ikke det fulde, bindende udbudsmateriale fra ordregiveren. Det er alene
        tilbudsgivers ansvar at sikre, at tilbuddet er korrekt, fuldstændigt og opfylder samtlige krav i udbuddet. Birdly
        fraskriver sig ethvert ansvar for oplysningernes rigtighed og for tilbuddets gyldighed eller udfald.
      </div>

      <p className="no-print" style={{ textAlign: "center", color: MUTED, fontSize: 12.5, marginTop: 20 }}>Skabelonen er et hjælpeværktøj — det bindende materiale ligger hos ordregiveren.</p>
    </main>
  );
}

function Check({ children }) {
  return (
    <li style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #F0F2F5", alignItems: "flex-start", color: "#41505E", fontSize: 14.5, lineHeight: 1.5 }}>
      <span aria-hidden style={{ flex: "0 0 auto", color: "#1E9E8A", fontWeight: 700 }}>☐</span><span>{children}</span>
    </li>
  );
}
