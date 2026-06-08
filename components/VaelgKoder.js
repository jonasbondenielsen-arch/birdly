"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { fetchCustomerCriteria, saveCustomerCriteria } from "../lib/catalog";
import "../app/tilmeld.css";

// Kunde-kodevalg-side (uden-for-kategori, DEL 4). Kunden kommer hertil via linket i
// "Send udbudskriterier"-mailen (?token=). Viser de fag Jonas har bygget ind + deres
// CPV-koder; kunden hakker af og gemmer. Ved gem rydder server out_of_category, og
// kunden flytter til den almindelige kundedatabase. Genbruger tilmeldingens stil.

export default function VaelgKoder({ token }) {
  const [data, setData] = useState(null);     // { company_name, fag:[{key,label_da,smal:[]}], selected:[] }
  const [areaSel, setAreaSel] = useState({}); // "fag::cpv" -> bool
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) { setError("Linket mangler en token."); setLoading(false); return; }
    fetchCustomerCriteria(token)
      .then((d) => {
        setData(d);
        const sel = {};
        for (const f of d.fag || []) for (const a of f.smal) if ((d.selected || []).includes(a.cpv)) sel[f.key + "::" + a.cpv] = true;
        setAreaSel(sel);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleArea(fagKey, cpv) {
    const k = fagKey + "::" + cpv;
    setAreaSel((s) => ({ ...s, [k]: !s[k] }));
  }
  function takeAll(f, on) {
    setAreaSel((s) => { const n = { ...s }; for (const a of f.smal) n[f.key + "::" + a.cpv] = on; return n; });
  }
  function fagAllOn(f) { return f.smal.length > 0 && f.smal.every((a) => areaSel[f.key + "::" + a.cpv]); }

  const selectedCpvs = [...new Set(Object.keys(areaSel).filter((k) => areaSel[k]).map((k) => k.split("::")[1]))];

  async function save() {
    if (saving) return;
    setSaving(true); setError("");
    try {
      await saveCustomerCriteria(token, selectedCpvs);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="birdly-tilmeld">
      <header>
        <div className="bar">
          <Logo height={32} />
          <Link href="/" className="back">← Til forsiden</Link>
        </div>
      </header>

      <div className="top">
        <span className="ey">🕊️ Så er vi klar til dit fag</span>
        <h1>Vælg dine opgaver</h1>
        <p>Hak de typer opgaver af, du vil høre om. Du kan altid ændre det senere.</p>
      </div>

      <div className="wrap">
        {loading && <div className="card"><div className="note">Henter dine muligheder …</div></div>}

        {!loading && error && !saved && (
          <div className="card"><div className="note warn">{error}</div></div>
        )}

        {!loading && data && !saved && (
          <div className="card">
            {error && <div className="note warn" style={{ marginBottom: 14 }}>{error}</div>}
            <div className="sec">
              <div className="h"><span className="n">✓</span><h3>{data.company_name || "Dine arbejdsområder"}</h3></div>
              {data.fag.length === 0 && <p className="sub">Der er endnu ikke sat fag op på din profil. Skriv til support@birdly.dk.</p>}

              {data.fag.map((f) => {
                const cnt = f.smal.filter((a) => areaSel[f.key + "::" + a.cpv]).length;
                return (
                  <div className="fag-block" key={f.key}>
                    <div className="fag-block-h">
                      <h4>{f.label_da}</h4>
                      {f.smal.length > 0 && (
                        <button type="button" className="takeall" onClick={() => takeAll(f, !fagAllOn(f))}>
                          {fagAllOn(f) ? "Fjern alle" : "Tag alle " + f.label_da + "-områder med"}
                        </button>
                      )}
                    </div>
                    {f.smal.length === 0 && <p className="sub" style={{ margin: "0 0 4px" }}>Ingen underområder — du matches på fagets brede koder.</p>}
                    <div className="area-grid">
                      {f.smal.map((a) => {
                        const k = f.key + "::" + a.cpv;
                        return (
                          <label className={"area" + (areaSel[k] ? " on" : "")} key={k}>
                            <input type="checkbox" checked={!!areaSel[k]} onChange={() => toggleArea(f.key, a.cpv)} />
                            <span>
                              <span className="area-title">{a.kunde_titel}</span>
                              {a.name_da && <span className="area-sub">{a.name_da}</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {f.smal.length > 3 && cnt >= 1 && cnt <= 3 && (
                      <div className="note" style={{ marginTop: 10 }}>
                        Du har valgt få områder her. Det giver færre, men meget præcise udbud. Vil du have flere, kan du vælge flere til — eller justere det senere.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="stepnav">
              <span />
              <button type="button" className="btn-next" onClick={save} disabled={saving || data.fag.length === 0}>{saving ? "Gemmer …" : "Gem mine valg →"}</button>
            </div>
          </div>
        )}

        {saved && (
          <div className="card ok show">
            <div className="ck"><svg viewBox="0 0 24 24" width="30"><path d="M5 13l4 4 10-11" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <h2>Tak — dine valg er gemt!</h2>
            <p>Vi holder nu øje med præcis de opgaver, du valgte, og sender dig en SMS, så snart der er et match.</p>
          </div>
        )}
      </div>
    </div>
  );
}
