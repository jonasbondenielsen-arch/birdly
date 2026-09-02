"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BirdMark } from "./Logo";
import "../app/start.css";

// ============================================================================
// /opdater-kort/[token] — siden kunden lander på fra "betalingen gik ikke igennem".
//
// ⚠️ DEN LOVER IKKE, AT KORTET ER GEMT, FØR DET ER. Frisbii svarer på sin egen
// accept_url; indtil da siger siden hvad der sker, ikke hvad vi håber. Et
// "tak, det er ordnet" der viser sig at være forkert, koster mere tillid end
// den fejl, kunden kom for at rette.
//
// ⚠️ FEJLER SESSIONEN, FÅR KUNDEN EN VEJ VIDERE. Kaldet mod Frisbii er den ene
// del af kæden der aldrig er kørt mod et rigtigt abonnement (se noten i
// kort-skift-session). Går den galt, må siden ikke stå tom — så beder den
// kunden skrive til os, og vi ordner det i hånden.
//
// ⚠️ INGEN KORTDATA RØRER OS. Alt indtastes i Frisbiis eget vindue; vi ser kun
// et session-id.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function loadReepay() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("ingen browser"));
    if (window.Reepay) return resolve(window.Reepay);
    const fundet = document.getElementById("reepay-checkout-js");
    if (fundet) {
      fundet.addEventListener("load", () => resolve(window.Reepay));
      fundet.addEventListener("error", () => reject(new Error("kunne ikke hente checkout")));
      return;
    }
    const s = document.createElement("script");
    s.id = "reepay-checkout-js";
    s.src = "https://checkout.reepay.com/checkout.js";
    s.onload = () => resolve(window.Reepay);
    s.onerror = () => reject(new Error("kunne ikke hente checkout"));
    document.head.appendChild(s);
  });
}

export default function OpdaterKort({ token }) {
  const [tilstand, setTilstand] = useState("klar"); // klar | henter | aabner | fejl | loest | kvitteret
  const [fejl, setFejl] = useState("");

  useEffect(() => {
    // Frisbii sender kunden tilbage hertil med ?kort=ok efter et gennemført skift.
    const p = new URLSearchParams(window.location.search);
    if (p.get("kort") === "ok") setTilstand("kvitteret");
  }, []);

  async function start() {
    setTilstand("henter");
    setFejl("");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/kort-skift-session`, {
        method: "POST",
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await r.json().catch(() => ({}));
      if (d?.error === "allerede_loest") { setTilstand("loest"); return; }
      if (!r.ok || !d?.session_id) throw new Error(d?.error || "ukendt");
      const Reepay = await loadReepay();
      setTilstand("aabner");
      new Reepay.ModalSubscription({ id: d.session_id });
    } catch (e) {
      console.error("[opdater-kort]", e?.message || e);
      setFejl(String(e?.message || e));
      setTilstand("fejl");
    }
  }

  return (
    <div className="pl">
      <header className="pl-top">
        <Link href="/" className="pl-mark" aria-label="Birdly forside">
          <BirdMark size={26} />
          <span>Birdly<span className="pl-dk">.dk</span></span>
        </Link>
      </header>

      <main className="pl-wrap">
        {tilstand === "kvitteret" ? (
          <div className="pl-kort">
            <h2>Tak — vi har fået jeres nye betalingsoplysninger</h2>
            <p className="pl-besk">
              Vi prøver trækningen igen inden for et døgn. Går den igennem, hører I ikke
              mere fra os om det. I har haft jeres adgang hele vejen igennem.
            </p>
          </div>
        ) : tilstand === "loest" ? (
          <div className="pl-kort">
            <h2>Det er allerede ordnet</h2>
            <p className="pl-besk">
              Betalingen er gået igennem, siden vi skrev til jer. I skal ikke foretage
              jer noget.
            </p>
          </div>
        ) : (
          <div className="pl-kort">
            <h2>Opdatér jeres betalingskort</h2>
            <p className="pl-besk">
              Vi kunne ikke gennemføre den seneste betaling. Det sker oftest, fordi
              kortet er udløbet eller er blevet spærret. I beholder jeres adgang
              imens — det tager et halvt minut at rette.
            </p>
            <button className="pl-knap" onClick={start} disabled={tilstand === "henter" || tilstand === "aabner"}>
              {tilstand === "henter" ? "Henter …" : tilstand === "aabner" ? "Åbner betalingsvinduet …" : "Opdatér kort"}
            </button>

            {tilstand === "fejl" && (
              <p className="pl-besk" style={{ color: "#b03a3a", marginTop: 12 }}>
                Vi kunne ikke åbne betalingsvinduet lige nu. Skriv til{" "}
                <a href="mailto:hello@birdly.dk">hello@birdly.dk</a>, så ordner vi det
                med det samme — I mister ikke jeres adgang imens.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
