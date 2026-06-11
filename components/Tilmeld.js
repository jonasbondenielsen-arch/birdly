"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { fetchCatalog, submitSignup } from "../lib/catalog";
import { derivePackage, packageMessage } from "../lib/pakke";
import "../app/tilmeld.css";

// 4-trins tilmeldingsflow. Katalog (fag + CPV + branchekode-map + regioner)
// hentes fra get-catalog. CVR-opslag via /api/cvr. Tilmelding gemmes atomisk
// via signup-Edge Function. Pakken UDLEDES af geografivalget (lib/pakke.js).

const STEPS = ["Virksomhed", "Arbejdsområder", "Geografi & pakke", "Bekræft"];

// Valgfrit beløbsinterval (kan springes over). null = ingen grænse.
const MIN_BANDS = [
  { label: "Ingen nedre grænse", val: null },
  { label: "100.000 kr.", val: 100000 },
  { label: "250.000 kr.", val: 250000 },
  { label: "500.000 kr.", val: 500000 },
  { label: "1 mio. kr.", val: 1000000 },
  { label: "2,5 mio. kr.", val: 2500000 },
  { label: "5 mio. kr.", val: 5000000 },
  { label: "10 mio. kr.", val: 10000000 },
];
const MAX_BANDS = [
  { label: "Ingen øvre grænse", val: null },
  { label: "500.000 kr.", val: 500000 },
  { label: "1 mio. kr.", val: 1000000 },
  { label: "2,5 mio. kr.", val: 2500000 },
  { label: "5 mio. kr.", val: 5000000 },
  { label: "10 mio. kr.", val: 10000000 },
  { label: "25 mio. kr.", val: 25000000 },
  { label: "50 mio. kr.", val: 50000000 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s) => String(s || "").replace(/\D/g, "");

// Telefon → internationalt E.164-format ("+45…"). Numre med landekode (ledende
// "+" eller "00") bevarer deres kode (svensk +46, norsk +47, UK +44 osv.).
// Et dansk 8-cifret nummer UDEN kode antages at være +45.
function normalizePhone(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  let hasCode = s.startsWith("+");
  if (s.startsWith("00")) { hasCode = true; s = s.slice(2); }   // 00-præfiks = international
  const d = s.replace(/\D/g, "");
  if (!d) return "";
  if (hasCode) return "+" + d;            // landekode allerede angivet
  if (d.length === 8) return "+45" + d;   // dansk nummer uden kode → antag +45
  return "+" + d;                          // øvrige uden "+": antag koden er med i tallet
}
// Gyldigt, hvis det normaliserede nummer holder sig inden for E.164 (8–15 cifre
// inkl. landekode). Dansk +45 + 8 cifre = 10; udenlandske numre passer typisk i 10–14.
function isValidPhone(raw) {
  const n = normalizePhone(raw);
  if (!n.startsWith("+")) return false;
  const len = n.slice(1).length;
  return len >= 8 && len <= 15;
}

export default function Tilmeld({ initialFag = null }) {
  const [step, setStep] = useState(1);
  const [catalog, setCatalog] = useState(null);
  const [catErr, setCatErr] = useState("");

  // Trin 1 — virksomhed
  const [company, setCompany] = useState("");
  const [cvr, setCvr] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cvrState, setCvrState] = useState({ loading: false, branchekode: null, found: null, msg: "" });
  // Inline feltfejl (trin 1) — vises LIGE under det relevante felt, ikke som banner.
  const [fieldErr, setFieldErr] = useState({});
  const fieldRules = {
    cvr: (v) => (digits(v).length === 8 ? "" : "Skriv et gyldigt CVR-nummer (8 cifre)."),
    email: (v) => (EMAIL_RE.test(String(v).trim()) ? "" : "Skriv en gyldig e-mail."),
    phone: (v) => (isValidPhone(v) ? "" : "Skriv et gyldigt mobilnummer — udenlandske numre med landekode (fx +46, +47, +44)."),
  };
  // Vis fejl ved blur (tomt/ugyldigt felt).
  function validateField(name, value) {
    setFieldErr((p) => ({ ...p, [name]: fieldRules[name](value) }));
  }
  // Ryd en feltfejl, så snart værdien bliver gyldig (mens man retter).
  function clearIfValid(name, value) {
    setFieldErr((p) => (p[name] && !fieldRules[name](value) ? { ...p, [name]: "" } : p));
  }

  // Trin 2 — arbejdsområder
  const [fagSel, setFagSel] = useState({});   // fag_key -> bool
  const [areaSel, setAreaSel] = useState({}); // "fag::cpv" -> bool
  const [bredde, setBredde] = useState("alle");

  // Trin 3 — geografi
  const [regionSel, setRegionSel] = useState({}); // region_key -> bool
  const [heleDk, setHeleDk] = useState(false);

  // Trin 4 — bekræft
  const [minIdx, setMinIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [terms, setTerms] = useState(false);

  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch((e) => setCatErr(e.message));
  }, []);

  // Forudvælg fag fra ?fag= (branchesidernes CTA), når kataloget er hentet.
  useEffect(() => {
    if (initialFag && catalog && (catalog.fag || []).some((f) => f.key === initialFag)) {
      setFagSel((s) => (s[initialFag] ? s : { ...s, [initialFag]: true }));
    }
  }, [catalog, initialFag]);

  const fagByKey = useMemo(() => {
    const m = {};
    for (const f of catalog?.fag || []) m[f.key] = f;
    return m;
  }, [catalog]);
  const regionLabels = useMemo(() => {
    const m = { hele_dk: "Hele Danmark" };
    for (const r of catalog?.regions || []) m[r.key] = r.label_da;
    return m;
  }, [catalog]);

  const selectedFagKeys = Object.keys(fagSel).filter((k) => fagSel[k]);
  const selectedRegionKeys = Object.keys(regionSel).filter((k) => regionSel[k]);
  const cpvSelections = useMemo(
    () => [...new Set(Object.keys(areaSel).filter((k) => areaSel[k]).map((k) => k.split("::")[1]))],
    [areaSel]
  );
  const pkgMsg = packageMessage(selectedRegionKeys, heleDk, regionLabels);

  // ---- CVR-opslag ----
  async function lookupCvr(raw) {
    const d = digits(raw);
    if (d.length !== 8) return;
    setCvrState((s) => ({ ...s, loading: true, msg: "" }));
    try {
      const r = await fetch(`/api/cvr?cvr=${d}`).then((x) => x.json());
      if (r.found) {
        if (r.name && !company.trim()) setCompany(r.name);
        let guesses = catalog?.branchekode_fag?.[r.branchekode] || [];
        if (!guesses.length && r.branchekode) {
          // Fald tilbage på 4-cifret branchekode-prefix, hvis 6-cifret ikke matcher.
          const p4 = r.branchekode.slice(0, 4);
          const set = new Set();
          for (const [code, fags] of Object.entries(catalog?.branchekode_fag || {})) {
            if (code.slice(0, 4) === p4) fags.forEach((f) => set.add(f));
          }
          guesses = [...set];
        }
        if (guesses.length) setFagSel((prev) => { const n = { ...prev }; guesses.forEach((k) => (n[k] = true)); return n; });
        const guessLabels = guesses.map((k) => fagByKey[k]?.label_da || k);
        setCvrState({
          loading: false, branchekode: r.branchekode, found: true,
          msg: (r.name ? r.name : "Virksomhed fundet") + (guessLabels.length ? " · foreslået fag: " + guessLabels.join(", ") : " · vælg selv dit fag i næste trin"),
        });
      } else {
        setCvrState({ loading: false, branchekode: null, found: false, msg: "Vi kunne ikke slå CVR op — udfyld selv nedenfor." });
      }
    } catch {
      setCvrState({ loading: false, branchekode: null, found: false, msg: "" });
    }
  }

  // ---- Trin 2 helpers ----
  function toggleFag(key) {
    setFagSel((s) => ({ ...s, [key]: !s[key] }));
  }
  function toggleArea(fagKey, cpv) {
    const k = fagKey + "::" + cpv;
    setAreaSel((s) => ({ ...s, [k]: !s[k] }));
  }
  function takeAllFag(fag, on) {
    setAreaSel((s) => {
      const n = { ...s };
      for (const a of fag.smal) n[fag.key + "::" + a.cpv] = on;
      return n;
    });
  }
  function fagAllOn(fag) {
    return fag.smal.length > 0 && fag.smal.every((a) => areaSel[fag.key + "::" + a.cpv]);
  }

  // ---- Trin 3 helpers ----
  function toggleRegion(key) {
    setHeleDk(false);
    setRegionSel((s) => ({ ...s, [key]: !s[key] }));
  }
  function pickHeleDk() {
    setHeleDk(true);
    setRegionSel({});
  }

  // ---- navigation ----
  function next() {
    setErr("");
    if (step === 1) {
      // Markér ALLE manglende/forkerte felter inline (ikke én samlet banner).
      const fe = { cvr: fieldRules.cvr(cvr), email: fieldRules.email(email), phone: fieldRules.phone(phone) };
      setFieldErr(fe);
      if (fe.cvr || fe.email || fe.phone) return;
    }
    if (step === 2) {
      if (selectedFagKeys.length === 0) return setErr("Vælg mindst ét fag.");
    }
    if (step === 3) {
      if (!heleDk && selectedRegionKeys.length === 0) return setErr("Vælg mindst én region — eller hele Danmark.");
    }
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit() {
    setErr("");
    if (!terms) return setErr("Sæt venligst flueben i samtykke for at fortsætte.");
    if (saving) return;
    const pkg = derivePackage(selectedRegionKeys, heleDk);
    const payload = {
      company_name: company.trim() || null,
      cvr: digits(cvr),
      contact_name: contact.trim() || null,
      email: email.trim(),
      phone: normalizePhone(phone),
      fag_keys: selectedFagKeys,
      cpv_selections: cpvSelections,
      bredde,
      region_keys: heleDk ? ["hele_dk"] : selectedRegionKeys,
      min_amount: MIN_BANDS[minIdx]?.val ?? null,
      max_amount: MAX_BANDS[maxIdx]?.val ?? null,
      notify_email: notifyEmail,
      notify_sms: notifySms,
      marketing_consent: marketing,
      terms_accepted: terms,
      cvr_branchekode: cvrState.branchekode,
      package: pkg,
    };
    setSaving(true);
    try {
      await submitSignup(payload);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e.message || "Noget gik galt. Prøv igen, eller skriv til support@birdly.dk.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="birdly-tilmeld">
      <header>
        <div className="bar">
          <Logo height={32} />
          <Link href="/" className="back">← Tilbage til forsiden</Link>
        </div>
      </header>

      <div className="top">
        <span className="ey">🐦 Gratis i 14 dage — ingen binding</span>
        <h1>Opret din profil</h1>
        <p>Jo mere præcist du udfylder, jo bedre match. Vi sender dig kun udbud, der rent faktisk passer til din virksomhed.</p>
      </div>

      <div className="wrap">
        {!submitted && (
          <>
            {/* Trinindikator */}
            <ol className="stepper" aria-label="Trin">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const state = n === step ? "on" : n < step ? "done" : "";
                return (
                  <li key={label} className={"stepitem " + state}>
                    <span className="dot">{n < step ? "✓" : n}</span>
                    <span className="lbl">{label}</span>
                  </li>
                );
              })}
            </ol>

            <div className="card">
              {catErr && <div className="note warn" style={{ marginBottom: 16 }}><b>Kataloget kunne ikke hentes.</b> {catErr} Prøv at genindlæse siden.</div>}
              {err && <div className="note warn" style={{ marginBottom: 16 }}>{err}</div>}

              {/* ---------------- TRIN 1 ---------------- */}
              {step === 1 && (
                <div className="sec">
                  <div className="h"><span className="n">1</span><h3>Din virksomhed</h3></div>
                  <p className="sub">Skriv dit CVR, så henter vi automatisk firmanavn og foreslår dit fag.</p>
                  <div className="grid2">
                    <div className="fg">
                      <label htmlFor="cvr">CVR-nummer</label>
                      <input id="cvr" inputMode="numeric" maxLength={8} placeholder="12345678" value={cvr}
                        aria-invalid={!!fieldErr.cvr}
                        onChange={(e) => { setCvr(e.target.value); clearIfValid("cvr", e.target.value); }}
                        onBlur={(e) => { lookupCvr(e.target.value); validateField("cvr", e.target.value); }} />
                      {fieldErr.cvr && <div className="field-err">{fieldErr.cvr}</div>}
                    </div>
                    <div className="fg">
                      <label htmlFor="firma">Virksomhedsnavn</label>
                      <input id="firma" placeholder="Firma" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <div className="fg"><label htmlFor="navn">Kontaktperson</label><input id="navn" placeholder="Fornavn Efternavn" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
                    <div className="fg">
                      <label htmlFor="mail">E-mail</label>
                      <input id="mail" type="email" placeholder="dig@firma.dk" value={email}
                        aria-invalid={!!fieldErr.email}
                        onChange={(e) => { setEmail(e.target.value); clearIfValid("email", e.target.value); }}
                        onBlur={(e) => validateField("email", e.target.value)} />
                      {fieldErr.email && <div className="field-err">{fieldErr.email}</div>}
                    </div>
                    <div className="fg">
                      <label htmlFor="mobil">Mobilnummer (til SMS)</label>
                      <input id="mobil" type="tel" placeholder="12 34 56 78 (udenlandsk: +46 …)" value={phone}
                        aria-invalid={!!fieldErr.phone}
                        onChange={(e) => { setPhone(e.target.value); clearIfValid("phone", e.target.value); }}
                        onBlur={(e) => validateField("phone", e.target.value)} />
                      {fieldErr.phone && <div className="field-err">{fieldErr.phone}</div>}
                    </div>
                  </div>
                  {cvrState.loading && <div className="note">Slår CVR op …</div>}
                  {!cvrState.loading && cvrState.msg && (
                    <div className={"note" + (cvrState.found ? "" : " warn")}>{cvrState.found ? "✓ " : ""}{cvrState.msg}</div>
                  )}
                </div>
              )}

              {/* ---------------- TRIN 2 ---------------- */}
              {step === 2 && (
                <div className="sec">
                  <div className="h"><span className="n">2</span><h3>Dine arbejdsområder</h3></div>
                  <p className="sub">Vælg din branche fra listen — du kan tilføje flere. Hvert fag folder sine egne områder ud, så du kun ser det, der er relevant for dig.</p>

                  {!catalog && !catErr && <div className="note">Henter fag …</div>}

                  {catalog && (
                    <>
                      {/* Dropdown: tilføj en branche ad gangen (allerede valgte vises ikke i listen) */}
                      <div className="fg" style={{ maxWidth: 440 }}>
                        <label htmlFor="fagvaelg">Tilføj din branche</label>
                        <select
                          id="fagvaelg"
                          value=""
                          onChange={(e) => { if (e.target.value) setFagSel((s) => ({ ...s, [e.target.value]: true })); }}
                        >
                          <option value="">Vælg din branche …</option>
                          {[...catalog.fag.map((f) => ({ key: f.key, label: f.label_da })), { key: "andet", label: "Andet — mit fag er ikke på listen" }]
                            .filter((o) => !fagSel[o.key])
                            .map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </select>
                      </div>

                      {/* Valgte fag som fjernbare tags */}
                      {selectedFagKeys.length > 0 && (
                        <div className="fagtags">
                          {selectedFagKeys.map((key) => (
                            <span className="fagtag" key={key}>
                              {key === "andet" ? "Andet" : (fagByKey[key]?.label_da || key)}
                              <button type="button" onClick={() => toggleFag(key)} aria-label="Fjern">×</button>
                            </span>
                          ))}
                        </div>
                      )}

                      {selectedFagKeys.length === 0 && <div className="note" style={{ marginTop: 14 }}>Vælg din branche i listen for at se områderne.</div>}

                      {selectedFagKeys.map((key) => {
                        const f = fagByKey[key];
                        if (!f) return null;
                        return (
                          <div className="fag-block" key={key}>
                            <div className="fag-block-h">
                              <h4>{f.label_da}</h4>
                              {f.smal.length > 0 && (
                                <button type="button" className="takeall" onClick={() => takeAllFag(f, !fagAllOn(f))}>
                                  {fagAllOn(f) ? "Fjern alle" : "Tag alle " + f.label_da + "-områder med"}
                                </button>
                              )}
                            </div>
                            {f.smal.length === 0 && <p className="sub" style={{ margin: "0 0 4px" }}>Ingen underområder — du matches på fagets brede koder.</p>}
                            <div className="area-grid">
                              {f.smal.map((a) => {
                                const k = key + "::" + a.cpv;
                                return (
                                  <label className={"area" + (areaSel[k] ? " on" : "")} key={k}>
                                    <input type="checkbox" checked={!!areaSel[k]} onChange={() => toggleArea(key, a.cpv)} />
                                    <span>
                                      <span className="area-title">{a.kunde_titel}</span>
                                      {a.name_da && <span className="area-sub">{a.name_da}</span>}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                            {(() => {
                              // Niche-note: kun ved 1-3 valgte koder når faget har flere end 3
                              // (ellers er der ikke noget at skrue på). Opdaterer dynamisk.
                              const cnt = f.smal.filter((a) => areaSel[key + "::" + a.cpv]).length;
                              return f.smal.length > 3 && cnt >= 1 && cnt <= 3 ? (
                                <div className="note" style={{ marginTop: 10 }}>
                                  Du har valgt få områder her. Det giver færre, men meget præcise udbud. Vil du have flere, kan du vælge flere til — eller justere det senere.
                                </div>
                              ) : null;
                            })()}
                          </div>
                        );
                      })}

                      {fagSel.andet && (
                        <div className="note" style={{ marginTop: 14 }}>
                          Vi dækker ikke helt dit fag endnu — men det er på vej. Du kommer i gang med et bredt udvalg af offentlige opgaver, og vi sætter snart søgningen op, så den passer mere præcist til netop din branche. Så sender vi dig en mail, hvor du selv kan vælge til.
                        </div>
                      )}

                      <div className="bredde">
                        <div className="bredde-q">Hvor bredt vil du fange byggeudbud?</div>
                        <label className={"bredde-opt" + (bredde === "fag" ? " on" : "")}>
                          <input type="radio" name="bredde" checked={bredde === "fag"} onChange={() => setBredde("fag")} />
                          <span><b>Kun fagentrepriser</b> — færre, men kun de præcise koder du valgte ovenfor.</span>
                        </label>
                        <label className={"bredde-opt" + (bredde === "alle" ? " on" : "")}>
                          <input type="radio" name="bredde" checked={bredde === "alle"} onChange={() => setBredde("alle")} />
                          <span><b>Alle bygge-udbud</b> — også de brede entrepriseudbud i dit fag. Flere match, lidt mere bredt. <i>(anbefalet)</i></span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ---------------- TRIN 3 ---------------- */}
              {step === 3 && (
                <div className="sec">
                  <div className="h"><span className="n">3</span><h3>Hvor vil du have udbud fra?</h3></div>
                  <p className="sub">Vælg din region — eller flere. Din pakke beregnes automatisk ud fra dit valg.</p>

                  <div className="region-grid">
                    {(catalog?.regions || []).map((r) => (
                      <label className={"chk" + (regionSel[r.key] ? " on" : "")} key={r.key}>
                        <input type="checkbox" checked={!!regionSel[r.key]} onChange={() => toggleRegion(r.key)} /> {r.label_da}
                      </label>
                    ))}
                  </div>

                  <label className={"hele-dk" + (heleDk ? " on" : "")}>
                    <input type="checkbox" checked={heleDk} onChange={(e) => (e.target.checked ? pickHeleDk() : setHeleDk(false))} />
                    <span><b>Hele Danmark</b> — alle fem regioner.</span>
                  </label>

                  {pkgMsg && (
                    <div className="pkg-reveal">
                      <div className="pkg-name">{pkgMsg.pkg.label}</div>
                      <div className="pkg-price">{pkgMsg.pkg.price.toLocaleString("da-DK")}<span> kr./md</span></div>
                      <div className="pkg-text">{pkgMsg.text} Gratis de første 14 dage.</div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- TRIN 4 ---------------- */}
              {step === 4 && (
                <div className="sec">
                  <div className="h"><span className="n">4</span><h3>Bekræft din tilmelding</h3></div>
                  <p className="sub">Tjek dine valg. Du betaler intet i dag — de første 14 dage er gratis.</p>

                  <div className="summary">
                    <div className="srow"><span className="sk">Virksomhed</span><span className="sv">{company || "—"}{cvr ? " · CVR " + digits(cvr) : ""}</span></div>
                    <div className="srow"><span className="sk">Kontakt</span><span className="sv">{[contact, email, normalizePhone(phone)].filter(Boolean).join(" · ") || "—"}</span></div>
                    <div className="srow"><span className="sk">Fag & områder</span><span className="sv">
                      {selectedFagKeys.map((k) => {
                        if (k === "andet") return <div key={k}><b>Andet</b> — bredt udvalg af bygge- og anlægsopgaver (vi bygger dit fag ind snart)</div>;
                        const f = fagByKey[k];
                        const chosen = (f?.smal || []).filter((a) => areaSel[k + "::" + a.cpv]).map((a) => a.kunde_titel);
                        return <div key={k}><b>{f?.label_da || k}</b>{chosen.length ? ": " + chosen.join(", ") : " (alle relevante udbud)"}</div>;
                      })}
                    </span></div>
                    <div className="srow"><span className="sk">Bredde</span><span className="sv">{bredde === "alle" ? "Alle bygge-udbud" : "Kun fagentrepriser"}</span></div>
                    <div className="srow"><span className="sk">Område</span><span className="sv">{heleDk ? "Hele Danmark" : selectedRegionKeys.map((k) => regionLabels[k]).join(", ") || "—"}</span></div>
                    <div className="srow hl"><span className="sk">Pakke</span><span className="sv">{pkgMsg ? pkgMsg.pkg.label + " — " + pkgMsg.pkg.price.toLocaleString("da-DK") + " kr./md" : "—"}</span></div>
                  </div>

                  <details className="amount-box">
                    <summary>Sæt en beløbsgrænse på udbuddene (valgfrit)</summary>
                    <div className="grid2" style={{ marginTop: 12 }}>
                      <div className="fg"><label>Mindste opgave</label>
                        <select value={minIdx} onChange={(e) => setMinIdx(+e.target.value)}>{MIN_BANDS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}</select>
                      </div>
                      <div className="fg"><label>Største opgave</label>
                        <select value={maxIdx} onChange={(e) => setMaxIdx(+e.target.value)}>{MAX_BANDS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}</select>
                      </div>
                    </div>
                    <div className="note">Udbud uden oplyst beløb sendes altid — vi sorterer dem ikke fra.</div>
                  </details>

                  <div className="notify-row">
                    <span className="notify-q">Sådan vil jeg have besked:</span>
                    <label className="chk-inline"><input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} /> SMS</label>
                    <label className="chk-inline"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} /> E-mail</label>
                  </div>

                  <div className="billing">
                    <svg viewBox="0 0 24 24" width="20" fill="none"><circle cx="12" cy="12" r="9" stroke="#B58A2E" strokeWidth="1.8" /><path d="M12 8v5M12 16h.01" stroke="#B58A2E" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    <div>Du betaler <b>intet i dag</b>. De første <b>14 dage er gratis</b> — opsiger du inden, trækkes du aldrig. Herefter fortsætter dit abonnement på <b>{pkgMsg ? pkgMsg.pkg.label : "den valgte pakke"}</b>, første betaling efter prøveperioden. Du kan opsige når som helst. Betaling tilkobles senere.</div>
                  </div>

                  <label className="consent"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Ja tak — Birdly må sende mig gode råd og nyheder på mail (kan altid frameldes). Valgfrit.</label>
                  <label className="consent"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> Jeg accepterer <Link href="/handelsbetingelser" style={{ color: "var(--sky)", fontWeight: 600 }}>handelsbetingelser</Link> og <Link href="/privatlivspolitik" style={{ color: "var(--sky)", fontWeight: 600 }}>privatlivspolitik</Link>, og at SMS og mail er en del af tjenesten.</label>
                </div>
              )}

              {/* ---------------- NAV ---------------- */}
              <div className="stepnav">
                {step > 1 ? <button type="button" className="btn-back" onClick={back}>← Tilbage</button> : <span />}
                {step < 4
                  ? <button type="button" className="btn-next" onClick={next}>Videre →</button>
                  : <button type="button" className="btn-next" onClick={onSubmit} disabled={saving}>{saving ? "Opretter …" : "Opret Birdly — gratis i 14 dage →"}</button>}
              </div>
            </div>

            <div className="trust">
              <span>✓ Gratis de første 14 dage</span><span>✓ Ingen binding</span><span>✓ Opsig når som helst</span>
            </div>
          </>
        )}

        {submitted && (
          <div className="card ok show">
            <div className="ck"><svg viewBox="0 0 24 24" width="30"><path d="M5 13l4 4 10-11" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <h2>Velkommen til Birdly!</h2>
            <p>Vi er i gang med at holde øje for dig. Du hører fra os på SMS og mail, så snart der er et udbud, der passer. De første 14 dage er gratis.</p>
          </div>
        )}
      </div>

      <p className="disclaimer">
        Birdly leverer udelukkende data fra de officielle platforme for offentlige og statslige udbud i Danmark (udbud.dk og EU's TED-database). Vi er en formidlingstjeneste, der sender relevant udbudsdata fra kilde til bruger. Et match er en henvisning til et offentligt udbud — ikke en garanti for, at din virksomhed opfylder udbuddets krav. Det er den enkelte virksomheds eget ansvar at vurdere og opfylde et udbuds krav og betingelser.
      </p>
    </div>
  );
}
