"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KATEGORIER, hentSamtykke, gemSamtykke } from "../lib/samtykke";

// ============================================================================
// SAMTYKKE-BANNER — slank bjælke i bunden, i sidens egne farver.
//
// Bevidst IKKE en blokerende overlay eller centreret modal. Et førstegangsbesøg skal
// kunne læse forsiden; en boks der dækker indholdet gør samtykket til en forhindring i
// stedet for et valg, og presser folk til at klikke "accepter alt" bare for at komme
// videre. Det er hverken god UX eller reelt frivilligt samtykke.
//
// Farverne er sidens egne tokens (navy/sky/teal) og en blød gradient opad, så bjælken
// glider ind i siden frem for at ligge oven på den.
// ============================================================================

export default function Samtykke() {
  const [vis, setVis] = useState(false);
  const [detaljer, setDetaljer] = useState(false);
  const [valg, setValg] = useState({ statistik: false, marketing: false });
  const boksRef = useRef(null);

  useEffect(() => {
    // Kun hvis der ikke er taget stilling. Kører efter hydrering, så serveren og
    // klienten ikke renderer forskelligt.
    if (hentSamtykke() === null) setVis(true);
    const igen = () => setVis(hentSamtykke() === null);
    window.addEventListener("birdly-samtykke", igen);
    return () => window.removeEventListener("birdly-samtykke", igen);
  }, []);

  // ⚠️ Forsidens chat-knap er fixed i bunden med z-index 200 — altså OVER bjælken. Uden
  // dette dækker den teal cirkel præcis "Accepter alle" på mobil og mellembredder, og så
  // kan man ikke acceptere. Vi måler bjælkens faktiske højde og melder den ud som
  // --samtykke-h, så forside.css kan løfte knappen op. Højden måles frem for at gættes,
  // fordi bjælken vokser når teksten wrapper og når "Tilpas" foldes ud.
  useEffect(() => {
    const krop = document.body;
    if (!vis) {
      krop.classList.remove("samtykke-vises");
      krop.style.removeProperty("--samtykke-h");
      return;
    }
    krop.classList.add("samtykke-vises");
    const maal = () => {
      const h = boksRef.current ? boksRef.current.offsetHeight : 0;
      krop.style.setProperty("--samtykke-h", `${h}px`);
    };
    maal();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(maal) : null;
    if (ro && boksRef.current) ro.observe(boksRef.current);
    window.addEventListener("resize", maal);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", maal);
      krop.classList.remove("samtykke-vises");
      krop.style.removeProperty("--samtykke-h");
    };
  }, [vis]);

  if (!vis) return null;

  const gem = (v) => { gemSamtykke(v); setVis(false); };

  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 90,
      // Gradienten lader indholdet tone ud opad i stedet for at blive skåret over.
      background: "linear-gradient(180deg, rgba(234,246,255,0) 0%, rgba(234,246,255,.92) 22%, var(--sky-soft) 100%)",
      padding: "26px 18px 16px",
      pointerEvents: "none",
    }}>
      <div ref={boksRef} role="region" aria-label="Samtykke til cookies" style={{
        pointerEvents: "auto",
        maxWidth: 980, margin: "0 auto",
        background: "var(--white)",
        border: "1px solid var(--sky-200)",
        borderRadius: "var(--r)",
        boxShadow: "var(--shadow)",
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <p style={{ margin: 0, flex: "1 1 380px", fontSize: 14.5, lineHeight: 1.6, color: "var(--navy)" }}>
            Vi bruger cookies til at få siden til at virke, og — hvis du siger ja — til at måle om
            vores annoncer rammer rigtigt. Du bestemmer selv.{" "}
            <Link href="/cookiepolitik" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "underline" }}>Cookiepolitik</Link>
            {" · "}
            <Link href="/privatlivspolitik" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "underline" }}>Privatlivspolitik</Link>
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={() => setDetaljer((d) => !d)}
              style={{ background: "none", border: "none", color: "var(--navy-soft)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: "10px 4px", fontFamily: "inherit" }}>
              {detaljer ? "Skjul valg" : "Tilpas"}
            </button>
            {/* Afvis står FØR accepter og har samme vægt. Et "kun nødvendige" der er
                gemt væk som et gråt link gør samtykket mindre frit end det ser ud. */}
            <button type="button" onClick={() => gem({ statistik: false, marketing: false })}
              style={{ background: "var(--white)", color: "var(--navy)", border: "1.5px solid var(--line)", borderRadius: 12, padding: "11px 18px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Kun nødvendige
            </button>
            <button type="button" onClick={() => gem({ statistik: true, marketing: true })}
              style={{ background: "var(--teal)", color: "var(--white)", border: 0, borderRadius: 12, padding: "11px 20px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Accepter alle
            </button>
          </div>
        </div>

        {detaljer && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            {KATEGORIER.map((k) => (
              <label key={k.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "8px 0", cursor: k.laast ? "default" : "pointer" }}>
                <input
                  type="checkbox"
                  checked={k.laast ? true : !!valg[k.id]}
                  disabled={k.laast}
                  onChange={(e) => setValg((v) => ({ ...v, [k.id]: e.target.checked }))}
                  style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--teal)" }}
                />
                <span>
                  <b style={{ fontSize: 14.5, color: "var(--navy)" }}>{k.navn}</b>
                  {k.laast && <span style={{ fontSize: 12.5, color: "var(--navy-soft)" }}> · altid aktiv</span>}
                  <div style={{ fontSize: 13.5, color: "var(--navy-soft)", lineHeight: 1.55 }}>{k.tekst}</div>
                </span>
              </label>
            ))}
            <button type="button" onClick={() => gem(valg)}
              style={{ marginTop: 10, background: "var(--navy)", color: "var(--white)", border: 0, borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Gem mit valg
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
