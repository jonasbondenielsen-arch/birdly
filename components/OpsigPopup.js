"use client";

import { useEffect, useState } from "react";
import { insertRow } from "../lib/supabase";
import "../app/opsig.css";

// Opsigelses-feedback-popup. DELTRIN 1: ren UI, ingen DB/mail.
// Når flowet wires (Deltrin 2/3): "Bekræft opsigelse" inserter en pending-
// anmodning via anon (write-only) og en server-side Edge Function sender det
// magiske bekræftelseslink. Den offentlige side må ALDRIG opsige direkte.

const REASONS = [
  { key: "dyr", label: "For dyrt i forhold til værdien", ctx: "Hvad ville en fair pris være for dig?" },
  { key: "faa", label: "Jeg fik for få relevante match", ctx: "Hvilket fag eller område savnede du match i?" },
  { key: "irrelevant", label: "Matchene ramte ved siden af mit fag eller område", ctx: "Hvad ramte forkert?" },
  { key: "vaerdi", label: "Det skabte ikke nok værdi for min forretning", ctx: "Hvad skulle der til, for at det gav værdi?" },
  { key: "anden", label: "Jeg bruger en anden løsning nu", ctx: "Hvilken løsning skiftede du til?" },
  { key: "behov", label: "Jeg har ikke behov lige nu", ctx: "Må vi sige til, når det bliver relevant igen?" },
  { key: "andet", label: "Andet", ctx: "Fortæl os gerne mere" },
];
const MAX_WORDS = 250;

function countWords(s) {
  return (s.trim().match(/\S+/g) || []).length;
}
// Keep the first `max` words (preserves whitespace between them).
function truncateWords(s, max) {
  const parts = s.split(/(\s+)/);
  let count = 0;
  let out = "";
  for (const p of parts) {
    if (/\S/.test(p)) {
      if (count >= max) break;
      count++;
    }
    out += p;
  }
  return out;
}

export default function OpsigPopup({ open, email, onClose }) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Reset every time the popup is (re)opened.
  useEffect(() => {
    if (open) {
      setReason("");
      setDetail("");
      setConfirmed(false);
      setSaving(false);
      setErr("");
    }
  }, [open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = REASONS.find((r) => r.key === reason);
  const isAndet = reason === "andet";
  const words = countWords(detail);

  function onDetailChange(v) {
    // "Andet" er en textarea med maks 250 ord — stop input ved grænsen.
    if (isAndet && countWords(v) > MAX_WORDS) v = truncateWords(v, MAX_WORDS);
    setDetail(v);
  }

  async function onConfirm() {
    if (saving) return;
    const mail = (email || "").trim();
    if (!mail) {
      setErr("Skriv din email i opsigelsesboksen først.");
      return;
    }
    setErr("");
    setSaving(true);
    try {
      // Trin 1: insert en pending-anmodning via anon (write-only, RLS tillader
      // kun status='pending' uden token/subscriber). Vi afslører IKKE om mailen
      // findes hos os — server-side (Edge Function) slår kunden op og sender
      // først bekræftelseslinket der. Selve opsigelsen sker FØRST når kunden
      // klikker linket (Trin 2). return=minimal: rækken læses ikke tilbage.
      await insertRow("cancellation_requests", {
        email: mail,
        reason,
        detail: detail.trim() || null,
        status: "pending",
      });
      setConfirmed(true);
    } catch {
      setErr("Noget gik galt — prøv igen, eller skriv til support@birdly.dk.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="birdly-opsig">
      <div className="opsig-bg" onClick={onClose} />
      <div className="opsig-modal" role="dialog" aria-modal="true" aria-label="Opsig Birdly">
        <button className="opsig-x" aria-label="Luk" onClick={onClose}>✕</button>

        {!confirmed ? (
          <>
            <h3>Inden du går</h3>
            <p className="opsig-sub">
              Vi bliver kede af at miste dig. Vil du kort fortælle os hvorfor? Det hjælper os med at gøre Birdly bedre.
            </p>

            <div className="opsig-reasons">
              {REASONS.map((r) => (
                <label key={r.key} className={"opsig-reason" + (reason === r.key ? " on" : "")}>
                  <input
                    type="radio"
                    name="opsig-reason"
                    value={r.key}
                    checked={reason === r.key}
                    onChange={() => {
                      setReason(r.key);
                      setDetail("");
                    }}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            {current && (
              <div className="opsig-detail">
                <label>
                  {current.ctx} <span className="opt">(valgfrit)</span>
                </label>
                {isAndet ? (
                  <>
                    <textarea value={detail} onChange={(e) => onDetailChange(e.target.value)} placeholder="Skriv her …" />
                    <div className={"opsig-count" + (words >= MAX_WORDS ? " max" : "")}>{words} / {MAX_WORDS} ord</div>
                  </>
                ) : (
                  <input type="text" value={detail} onChange={(e) => onDetailChange(e.target.value)} placeholder="Skriv her …" />
                )}
              </div>
            )}

            {err && <p className="opsig-err">{err}</p>}

            <div className="opsig-actions">
              <button type="button" className="opsig-keep" onClick={onClose}>
                Behold mit abonnement
              </button>
              <button type="button" className="opsig-confirm" disabled={!reason || saving} onClick={onConfirm}>
                {saving ? "Sender …" : "Bekræft opsigelse"}
              </button>
            </div>
          </>
        ) : (
          <div className="opsig-bye">
            <h3>Vi har sendt dig en mail 🕊️</h3>
            <div className="opsig-note">
              Vi er kede af at du vil flyve fra reden, men vi har sendt en bekræftelse til din mail som du skal
              godkende, så vi er sikre på det er dig. Tjek din indbakke og klik på linket for at gennemføre
              opsigelsen. Indtil da er intet ændret. Og husk — reden står altid åben, hvis du får lyst til at
              vende tilbage. 🪺
            </div>
            <div className="opsig-actions">
              <button type="button" className="opsig-keep" onClick={onClose}>Luk</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
