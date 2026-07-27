"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { fetchCatalog, submitSignup, createSubscriptionSession } from "../lib/catalog";
import { PLAN, TRIAL_DAYS, YEARLY_SAVING, priceText, planForInterval } from "../lib/pakke";
import "../app/tilmeld.css";

// Pris inkl. moms (25 %) i da-DK, fx 299 → "373,75". Kun til visning på plan-kortene.
const inclMoms = (n) => (n * 1.25).toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 4-trins tilmeldingsflow (én funnel — altid kort + 14 dages trial, test-mode indtil
// go-live). Katalog (fag + CPV + branchekode-map + regioner) hentes fra get-catalog.
// CVR-opslag via /api/cvr. Tilmelding gemmes atomisk via signup-Edge Function.
//
//   1 Virksomhed · 2 Arbejdsområder · 3 Geografi (+ kriterier + betingelses-accept)
//   · 4 Vælg plan + betaling (Frisbii modal subscription).
//
// Frisbii ejer al betalingslogik. Trin 4 opretter en subscription-session og åbner
// den i Reepay.ModalSubscription (overlay) ved klik; kortet gemmes i trial, første
// træk efter 14 dage.

// Indlæs Frisbii/Reepay checkout-SDK'et én gang. Resolver med window.Reepay.
function loadReepay() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Reepay) return resolve(window.Reepay);
    const existing = document.getElementById("reepay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Reepay));
      existing.addEventListener("error", () => reject(new Error("Betalingsvinduet kunne ikke indlæses.")));
      return;
    }
    const s = document.createElement("script");
    s.id = "reepay-checkout-js";
    s.src = "https://checkout.reepay.com/checkout.js";
    s.async = true;
    s.onload = () => resolve(window.Reepay);
    s.onerror = () => reject(new Error("Betalingsvinduet kunne ikke indlæses."));
    document.head.appendChild(s);
  });
}

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

// Landekoder til telefon-vælgeren. Danmark står først (default). Nordisk +
// bredere EU/EØS-udvalg. Søgbar via type-ahead på landenavnet i <select>.
const DIAL_CODES = [
  { iso: "DK", flag: "🇩🇰", name: "Danmark", code: "+45" },
  { iso: "SE", flag: "🇸🇪", name: "Sverige", code: "+46" },
  { iso: "NO", flag: "🇳🇴", name: "Norge", code: "+47" },
  { iso: "FI", flag: "🇫🇮", name: "Finland", code: "+358" },
  { iso: "IS", flag: "🇮🇸", name: "Island", code: "+354" },
  { iso: "FO", flag: "🇫🇴", name: "Færøerne", code: "+298" },
  { iso: "GL", flag: "🇬🇱", name: "Grønland", code: "+299" },
  { iso: "DE", flag: "🇩🇪", name: "Tyskland", code: "+49" },
  { iso: "NL", flag: "🇳🇱", name: "Holland", code: "+31" },
  { iso: "BE", flag: "🇧🇪", name: "Belgien", code: "+32" },
  { iso: "GB", flag: "🇬🇧", name: "Storbritannien", code: "+44" },
  { iso: "IE", flag: "🇮🇪", name: "Irland", code: "+353" },
  { iso: "FR", flag: "🇫🇷", name: "Frankrig", code: "+33" },
  { iso: "ES", flag: "🇪🇸", name: "Spanien", code: "+34" },
  { iso: "PT", flag: "🇵🇹", name: "Portugal", code: "+351" },
  { iso: "IT", flag: "🇮🇹", name: "Italien", code: "+39" },
  { iso: "AT", flag: "🇦🇹", name: "Østrig", code: "+43" },
  { iso: "CH", flag: "🇨🇭", name: "Schweiz", code: "+41" },
  { iso: "PL", flag: "🇵🇱", name: "Polen", code: "+48" },
  { iso: "CZ", flag: "🇨🇿", name: "Tjekkiet", code: "+420" },
  { iso: "EE", flag: "🇪🇪", name: "Estland", code: "+372" },
  { iso: "LV", flag: "🇱🇻", name: "Letland", code: "+371" },
  { iso: "LT", flag: "🇱🇹", name: "Litauen", code: "+370" },
];

// Nummer-feltet er KUN cifre — landekoden styres alene af vælgeren. Indsætter
// nogen et helt internationalt nummer (+ / 00 / landekode), fjernes præfikset, så
// vi aldrig får dobbelt landekode. National trunk-0 (SE/NO/UK skriver ofte 0
// foran) fjernes også — danske numre har aldrig et 0 foran.
function sanitizeNationalNumber(raw, dialCode) {
  let s = String(raw || "").trim();
  let intl = s.startsWith("+");
  if (s.startsWith("00")) { intl = true; s = s.slice(2); }
  let d = s.replace(/\D/g, "");
  const code = String(dialCode).replace(/\D/g, "");
  if (intl && code && d.startsWith(code)) d = d.slice(code.length); // fjern indsat landekode
  return d.replace(/^0+/, "");                                       // fjern national trunk-0
}
// Fuldt E.164 = landekode + nationalt nummer. Dansk kræver præcis 8 cifre;
// udenlandske numre valideres bredt mod E.164 (8–15 cifre inkl. landekode).
function isValidFullPhone(dialCode, national) {
  const code = String(dialCode).replace(/\D/g, "");
  const n = String(national || "").replace(/\D/g, "");
  if (!n) return false;
  if (dialCode === "+45") return n.length === 8;
  const total = code.length + n.length;
  return total >= 8 && total <= 15;
}
// Sammensæt til E.164-streng, fx "+45" + "40576934" → "+4540576934".
const toE164 = (dialCode, national) => dialCode + String(national || "").replace(/\D/g, "");
const phoneErrMsg = (dialCode) =>
  dialCode === "+45" ? "Skriv et gyldigt mobilnummer (8 cifre)." : "Skriv et gyldigt mobilnummer med landekode.";

export default function Tilmeld({ initialFag = null }) {
  const [step, setStep] = useState(1);
  const [catalog, setCatalog] = useState(null);
  const [catErr, setCatErr] = useState("");

  // Trin 1 — virksomhed
  const [company, setCompany] = useState("");
  const [cvr, setCvr] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+45");   // landekode-vælger, default Danmark
  const [phone, setPhone] = useState("");     // KUN nationale cifre (uden landekode)
  const [cvrState, setCvrState] = useState({ loading: false, branchekode: null, found: null, msg: "" });
  // Inline feltfejl (trin 1) — vises LIGE under det relevante felt, ikke som banner.
  const [fieldErr, setFieldErr] = useState({});
  const fieldRules = {
    cvr: (v) => (digits(v).length === 8 ? "" : "Skriv et gyldigt CVR-nummer (8 cifre)."),
    email: (v) => (EMAIL_RE.test(String(v).trim()) ? "" : "Skriv en gyldig e-mail."),
  };
  // Vis fejl ved blur (tomt/ugyldigt felt).
  function validateField(name, value) {
    setFieldErr((p) => ({ ...p, [name]: fieldRules[name](value) }));
  }
  // Ryd en feltfejl, så snart værdien bliver gyldig (mens man retter).
  function clearIfValid(name, value) {
    setFieldErr((p) => (p[name] && !fieldRules[name](value) ? { ...p, [name]: "" } : p));
  }
  // Telefon valideres på landekode + nummer (begge eksplicit, da state er async).
  function validatePhone(dialCode, national) {
    setFieldErr((p) => ({ ...p, phone: isValidFullPhone(dialCode, national) ? "" : phoneErrMsg(dialCode) }));
  }
  function clearPhoneIfValid(dialCode, national) {
    setFieldErr((p) => (p.phone && isValidFullPhone(dialCode, national) ? { ...p, phone: "" } : p));
  }

  // Trin 2 — arbejdsområder
  const [fagSel, setFagSel] = useState({});   // fag_key -> bool
  const [areaSel, setAreaSel] = useState({}); // "fag::cpv" -> bool
  const [bredde, setBredde] = useState("alle");

  // Trin 3 — geografi + kriterier + samtykke (alle kundeoplysninger samles her)
  const [regionSel, setRegionSel] = useState({}); // region_key -> bool
  const [heleDk, setHeleDk] = useState(false);
  const [minIdx, setMinIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [terms, setTerms] = useState(false);

  // Trin 4 — vælg plan + betaling. Default = årlig (anbefalet).
  const [billing, setBilling] = useState("yearly"); // "monthly" | "yearly" — vælger plan-handle

  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");

  // Betaling: createdId = subscriber-uuid fra signup (undgår dubletter ved frem/tilbage).
  // sessionId = Frisbii-session til SDK'et. sessionLoading = mens en (gen)session hentes.
  const [createdId, setCreatedId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const steps = ["Virksomhed", "Arbejdsområder", "Geografi", "Vælg plan + betaling"];

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
  // Områdetekst til opsummering (geografi styrer kun matching, ikke pris).
  const omraadeText = heleDk
    ? "Hele Danmark"
    : selectedRegionKeys.map((k) => regionLabels[k]).join(", ");

  // Kompakt recap til trin 4 (fag · område · kanaler) — read-only.
  const recapText = [
    selectedFagKeys.map((k) => (k === "andet" ? "Andet" : (fagByKey[k]?.label_da || k))).join(", "),
    omraadeText,
    [notifySms && "SMS", notifyEmail && "e-mail"].filter(Boolean).join(" + "),
  ].filter(Boolean).join(" · ");

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

  // ---- navigation (trin 1-2; trin 3 bruger startPayment) ----
  function next() {
    setErr("");
    if (step === 1) {
      // Markér ALLE manglende/forkerte felter inline (ikke én samlet banner).
      const fe = { cvr: fieldRules.cvr(cvr), email: fieldRules.email(email), phone: isValidFullPhone(dial, phone) ? "" : phoneErrMsg(dial) };
      setFieldErr(fe);
      if (fe.cvr || fe.email || fe.phone) return;
    }
    if (step === 2) {
      if (selectedFagKeys.length === 0) return setErr("Vælg mindst ét fag.");
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Byg signup-payload fra al state (trin 1-3). package er informativ — den
  // autoritative plan kommer fra Frisbii via webhook (Fase C).
  function buildSignupPayload() {
    return {
      company_name: company.trim() || null,
      cvr: digits(cvr),
      contact_name: contact.trim() || null,
      email: email.trim(),
      phone: toE164(dial, phone),
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
      package: planForInterval(billing),
    };
  }

  // Opret/hent en Frisbii subscription-session for det valgte interval. Returnerer
  // session-id (eller kaster). reuseCustomer=true ved plan-skift (kunden findes
  // allerede hos Frisbii → referér i stedet for at oprette igen).
  async function makeSession(id, billingChoice, reuseCustomer = false) {
    const { session_id } = await createSubscriptionSession({
      subscriber_id: id,
      email: email.trim(),
      contact_name: contact.trim(),
      phone: toE164(dial, phone),
      billing: billingChoice,
      reuse_customer: reuseCustomer,
    });
    return session_id;
  }

  // Trin 3 CTA → opret subscriber (én gang) + session, og gå til betalings-trinnet.
  async function startPayment() {
    setErr("");
    if (!heleDk && selectedRegionKeys.length === 0) return setErr("Vælg mindst én region — eller hele Danmark.");
    if (!terms) return setErr("Sæt flueben i betingelserne for at fortsætte.");
    if (saving) return;
    setSaving(true);
    try {
      let id = createdId;
      if (!id) {
        const r = await submitSignup(buildSignupPayload());
        id = r.id;
        setCreatedId(id);
      }
      const session_id = await makeSession(id, billing);
      setSessionId(session_id);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e.message || "Noget gik galt. Prøv igen, eller skriv til support@birdly.dk.");
    } finally {
      setSaving(false);
    }
  }

  // Plan-skift på trin 4: gen-opret sessionen for det nye handle (ellers betaler
  // kunden for forkert plan). Embedded remountes når sessionId skifter.
  async function changeBilling(nextBilling) {
    if (nextBilling === billing) return;
    setBilling(nextBilling);
    if (step !== 4 || !createdId) return;
    setErr("");
    setSessionLoading(true);
    setSessionId(null); // afmontér nuværende embedded mens vi henter ny session
    try {
      const session_id = await makeSession(createdId, nextBilling, true);
      setSessionId(session_id);
    } catch (e) {
      setErr("Kunne ikke skifte plan. Prøv igen, eller skriv til support@birdly.dk.");
    } finally {
      setSessionLoading(false);
    }
  }

  // Åbn Frisbii-betalingen som MODAL (overlay) for den valgte plans session. Modal
  // viser alle kortfelter udfoldet uden indre scroll. Frisbii styrer kort + trial; vi
  // reagerer kun på events. Accept → "Velkommen" (autoritativ aktivering = webhook,
  // Fase C). Cancel/Close → kunden lukkede uden at gennemføre → bliv på trin 4.
  function openPaymentModal() {
    if (!sessionId || sessionLoading || saving) return;
    setErr("");
    loadReepay()
      .then((Reepay) => {
        const rp = new Reepay.ModalSubscription(sessionId);
        rp.addEventHandler(Reepay.Event.Accept, () => {
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        rp.addEventHandler(Reepay.Event.Error, () => {
          setErr("Der opstod en fejl i betalingen. Prøv igen, eller skriv til support@birdly.dk.");
        });
        // Cancel (kunden trykker annullér) + Close (modal lukket) → intet oprettet,
        // bliv på trin 4. Sessionen kan genåbnes med samme CTA.
        rp.addEventHandler(Reepay.Event.Cancel, () => {});
        rp.addEventHandler(Reepay.Event.Close, () => {});
      })
      .catch((e) => setErr(e.message || "Betalingsvinduet kunne ikke indlæses."));
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
        <span className="ey">🐦 Gratis i {TRIAL_DAYS} dage — ingen binding</span>
        <h1>Opret din profil</h1>
        <p>Jo mere præcist du udfylder, jo bedre match. Vi sender dig kun opgaver, der rent faktisk passer til din virksomhed.</p>
      </div>

      <div className="wrap">
        {!submitted && (
          <>
            {/* Trinindikator */}
            <ol className="stepper" aria-label="Trin">
              {steps.map((label, i) => {
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
                        onChange={(e) => { const v = digits(e.target.value).slice(0, 8); setCvr(v); clearIfValid("cvr", v); }}
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
                      <div style={{ display: "flex", gap: 8 }}>
                        <select aria-label="Landekode" value={dial}
                          style={{ flex: "0 0 auto", width: "auto", maxWidth: 190 }}
                          onChange={(e) => { setDial(e.target.value); clearPhoneIfValid(e.target.value, phone); }}
                          onBlur={() => validatePhone(dial, phone)}>
                          {DIAL_CODES.map((c) => (
                            <option key={c.iso} value={c.code}>{c.flag} {c.name} {c.code}</option>
                          ))}
                        </select>
                        <input id="mobil" type="tel" inputMode="numeric" placeholder="40 57 69 34" value={phone}
                          aria-invalid={!!fieldErr.phone}
                          style={{ flex: "1 1 auto", minWidth: 0 }}
                          onChange={(e) => { const v = sanitizeNationalNumber(e.target.value, dial); setPhone(v); clearPhoneIfValid(dial, v); }}
                          onBlur={() => validatePhone(dial, phone)} />
                      </div>
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
                                  Du har valgt få områder her. Det giver færre, men meget præcise opgaver. Vil du have flere, kan du vælge flere til — eller justere det senere.
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
                        <div className="bredde-q">Hvor bredt vil du fange byggeopgaver?</div>
                        <label className={"bredde-opt" + (bredde === "fag" ? " on" : "")}>
                          <input type="radio" name="bredde" checked={bredde === "fag"} onChange={() => setBredde("fag")} />
                          <span><b>Kun fagentrepriser</b> — færre, men kun de præcise koder du valgte ovenfor.</span>
                        </label>
                        <label className={"bredde-opt" + (bredde === "alle" ? " on" : "")}>
                          <input type="radio" name="bredde" checked={bredde === "alle"} onChange={() => setBredde("alle")} />
                          <span><b>Alle bygge-opgaver</b> — også de brede entrepriseudbud i dit fag. Flere match, lidt mere bredt. <i>(anbefalet)</i></span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ---------------- TRIN 3 — geografi + kriterier + samtykke ---------------- */}
              {step === 3 && (
                <div className="sec">
                  <div className="h"><span className="n">3</span><h3>Hvor vil du have opgaver fra?</h3></div>
                  <p className="sub">Vælg din region — eller flere, eller hele Danmark. Området bestemmer hvilke opgaver du får; <b>prisen er den samme uanset dækning</b>.</p>

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

                  {/* Beløbsgrænse (valgfri) — hører til matching-kriterierne */}
                  <details className="amount-box">
                    <summary>Sæt en beløbsgrænse på opgaverne (valgfrit)</summary>
                    <div className="grid2" style={{ marginTop: 12 }}>
                      <div className="fg"><label>Mindste opgave</label>
                        <select value={minIdx} onChange={(e) => setMinIdx(+e.target.value)}>{MIN_BANDS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}</select>
                      </div>
                      <div className="fg"><label>Største opgave</label>
                        <select value={maxIdx} onChange={(e) => setMaxIdx(+e.target.value)}>{MAX_BANDS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}</select>
                      </div>
                    </div>
                    <div className="note">Opgaver uden oplyst beløb sendes altid — vi sorterer dem ikke fra.</div>
                  </details>

                  {/* Notifikationskanaler */}
                  <div className="notify-row">
                    <span className="notify-q">Sådan vil jeg have besked:</span>
                    <label className="chk-inline"><input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} /> SMS</label>
                    <label className="chk-inline"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} /> E-mail</label>
                  </div>

                  {/* Samtykke — påkrævet betingelses-flueben gater CTA'en. Kort label;
                      de juridiske links står stablet under boksen, ikke i én flydende linje. */}
                  <div className="consent-block">
                    <label className="consent">
                      <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                      <span>Jeg accepterer Birdlys betingelser, og at SMS og mail er en del af tjenesten.</span>
                    </label>
                    <div className="consent-links">
                      <Link href="/handelsbetingelser">Handels- og leveringsbetingelser</Link>
                      <Link href="/privatlivspolitik">Privatlivspolitik</Link>
                    </div>
                    <label className="consent consent-opt">
                      <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                      <span>Ja tak — send mig gode råd og nyheder på mail (kan altid frameldes). Valgfrit.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ---------------- TRIN 4 — vælg plan + betaling ---------------- */}
              {step === 4 && (
                <div className="sec">
                  <div className="h"><span className="n">4</span><h3>Vælg din plan</h3></div>
                  <p className="sub">Gratis prøveperiode · du betaler intet i dag · opsig når som helst inden.</p>

                  {/* Kompakt recap (read-only) */}
                  {recapText && <div className="recap">{recapText}</div>}

                  {/* Plan-toggle — to kort i den eksisterende .plan-stil (samme som ville
                      blive brugt til pakkevalg). Skift gen-opretter sessionen. */}
                  <div className="plans plans-2" role="radiogroup" aria-label="Vælg betalingsinterval">
                    <label className={"plan" + (billing === "monthly" ? " on" : "")}>
                      <input type="radio" name="billing" checked={billing === "monthly"} disabled={sessionLoading} onChange={() => changeBilling("monthly")} />
                      <div className="nm">Månedlig</div>
                      <div className="pr">{PLAN.monthly.toLocaleString("da-DK")}<span> kr./md</span></div>
                      <div className="ds">ex. moms · {inclMoms(PLAN.monthly)} inkl.</div>
                    </label>
                    <label className={"plan" + (billing === "yearly" ? " on" : "")}>
                      <span className="feat">Spar {YEARLY_SAVING.pct}%</span>
                      <input type="radio" name="billing" checked={billing === "yearly"} disabled={sessionLoading} onChange={() => changeBilling("yearly")} />
                      <div className="nm">Årlig</div>
                      <div className="pr">{PLAN.yearly.toLocaleString("da-DK")}<span> kr./år</span></div>
                      <div className="ds">ex. moms · forudbetalt · {inclMoms(PLAN.yearly)} inkl.</div>
                    </label>
                  </div>

                  {/* Betaling — accepterede metoder (valg sker i selve betalingsvinduet) */}
                  <div className="bredde-q" style={{ marginTop: 4 }}>Betaling</div>
                  <div className="pay-methods" aria-hidden="true">
                    <span className="pm-tab">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.94c1.5 0 2.75-1.06 4-1.06 1.25 0 2.5 1.06 4 1.06" /><path d="M16 6c-1.5 0-3 1-4 3-1-2-2.5-3-4-3-2 0-3.5 2-3.5 5 0 4 3.5 8 5.5 8" /></svg>
                      Apple Pay
                    </span>
                    <span className="pm-tab">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      Kort
                    </span>
                    <span className="pm-tab">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="3" width="10" height="18" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                      MobilePay
                    </span>
                  </div>
                  <p className="sub" style={{ margin: "0 0 16px 36px" }}>Du vælger metode og indtaster kort i betalingsvinduet.</p>

                  {/* Primær CTA — åbner Frisbii-betalingen som modal (overlay) for den
                      valgte plans session. Deaktiveret indtil sessionen er klar. */}
                  <button type="button" className="submit" onClick={openPaymentModal} disabled={!sessionId || sessionLoading}>
                    {sessionLoading ? "Forbereder betaling …" : "Start gratis prøveperiode →"}
                  </button>

                  <div className="pay-secure" style={{ justifyContent: "center", marginTop: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                    Sikker betaling via Frisbii · Ingen binding · Opsig når som helst
                  </div>
                  <div className="note" style={{ marginTop: 10 }}>
                    Kortoplysninger indtastes direkte hos vores PCI-sikre betalingspartner (Frisbii). Birdly ser eller gemmer aldrig dit kortnummer.
                  </div>
                </div>
              )}

              {/* ---------------- NAV ---------------- */}
              <div className="stepnav">
                {step > 1 ? <button type="button" className="btn-back" onClick={back}>← Tilbage</button> : <span />}
                {step < 3 && <button type="button" className="btn-next" onClick={next}>Videre →</button>}
                {step === 3 && (
                  <button type="button" className="btn-next" onClick={startPayment} disabled={saving || !terms}>
                    {saving ? "Forbereder betaling …" : "Prøv gratis i 14 dage →"}
                  </button>
                )}
                {step === 4 && <span />}
              </div>
            </div>

            <div className="trust">
              <span>✓ Gratis i {TRIAL_DAYS} dage</span><span>✓ Ingen binding</span><span>✓ Opsig når som helst</span>
            </div>
          </>
        )}

        {submitted && (
          <div className="card ok show">
            <div className="ck"><svg viewBox="0 0 24 24" width="30"><path d="M5 13l4 4 10-11" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <h2>Velkommen til Birdly!</h2>
            <p>Vi er i gang med at holde øje for dig. Du hører fra os på SMS og mail, så snart der er et udbud, der passer.</p>
          </div>
        )}
      </div>

      <p className="disclaimer">
        Birdly leverer udelukkende data fra de officielle platforme for offentlige og statslige udbud i Danmark (udbud.dk og EU's TED-database). Vi er en formidlingstjeneste, der sender relevant udbudsdata fra kilde til bruger. Et match er en henvisning til et offentligt udbud — ikke en garanti for, at din virksomhed opfylder udbuddets krav. Det er den enkelte virksomheds eget ansvar at vurdere og opfylde et udbuds krav og betingelser.
      </p>
    </div>
  );
}
