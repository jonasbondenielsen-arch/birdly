"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { hentGenaktivering, anmodGenaktivering } from "../lib/genaktiver";

// ============================================================================
// FORNY ABONNEMENT — win-back-siden bag /fornyt/<token>.
//
// ⚠️ SIDEN AFGOER INTET. Plan, pris og om kunden har ret til en gratis proeve
// kommer fra serveren; samtykket verificeres serveren ogsaa. Denne komponent
// viser og sender videre - den regner ikke.
//
// ⚠️ INTET KLIK MAA DEAD-ENDE. Er kortbetaling ikke live endnu (flaget
// `kortbetaling_live`), faar kunden en kvittering paa at vi sender et
// fornyelseslink, og Jonas notificeres pr. mail. Det er den rigtige tilstand
// indtil Clearhaus er godkendt - ikke en fejltilstand, og den skal derfor heller
// ikke se ud som en.
//
// ⚠️ KORTDATA ROERER ALDRIG VORES DOMAENE. Gaar betalingen live, sendes kunden
// til Frisbiis hostede side. Byg aldrig et kortfelt ind her.
// ============================================================================

const NAVY = "#0D274A";
const MUTED = "#5A6B7F";

const KNAP = {
  background: "#1E9E8A", color: "#fff", border: 0, borderRadius: 10,
  padding: "13px 22px", fontSize: 16, fontWeight: 700, cursor: "pointer",
};

export default function Fornyt({ token }) {
  const [data, setData] = useState(null);
  const [fejl, setFejl] = useState("");
  const [plan, setPlan] = useState("aar");
  const [samtykke, setSamtykke] = useState(false);
  const [sender, setSender] = useState(false);
  const [kvittering, setKvittering] = useState(null);

  useEffect(() => {
    let afbrudt = false;
    (async () => {
      const d = await hentGenaktivering(token);
      if (afbrudt) return;
      if (!d.found) setFejl(d.lukket ? "Genaktivering er ikke åben lige nu." : "Linket er ikke gyldigt.");
      else setData(d);
    })();
    return () => { afbrudt = true; };
  }, [token]);

  async function send() {
    setSender(true); setFejl("");
    try {
      const r = await anmodGenaktivering({ token, plan, samtykke });
      if (r.manuel) {
        setKvittering(r.besked);
      } else {
        // ⚠️ NAAR KORTBETALING GAAR LIVE: her sendes kunden videre til Frisbiis
        // hostede betalingsside via create-subscription-session, med
        // `uden_proeve` som SERVEREN har afgjort. Indtil da naas denne gren
        // aldrig - flaget staar slukket.
        setKvittering("Du sendes videre til betaling …");
      }
    } catch (e) {
      setFejl(e.message);
    } finally {
      setSender(false);
    }
  }

  if (fejl && !data) {
    return (
      <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ color: NAVY, fontSize: 26 }}>Forny dit abonnement</h1>
        <p style={{ color: MUTED, lineHeight: 1.7 }}>{fejl}</p>
        <p style={{ color: MUTED, lineHeight: 1.7 }}>
          Skriv til <a href="mailto:support@birdly.dk">support@birdly.dk</a>, så hjælper vi dig videre.
        </p>
      </main>
    );
  }

  if (!data) {
    return <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 20px", color: MUTED }}>Henter …</main>;
  }

  if (kvittering) {
    return (
      <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ color: NAVY, fontSize: 26, marginBottom: 10 }}>Tak{data.kontakt ? `, ${String(data.kontakt).split(/\s+/)[0]}` : ""}</h1>
        <p style={{ color: NAVY, fontSize: 17, lineHeight: 1.7 }}>{kvittering}</p>
        <p style={{ color: MUTED, lineHeight: 1.7, marginTop: 18 }}>
          Vi har noteret at du vil fortsætte på {data.planer[plan].navn.toLowerCase()} til {data.planer[plan].pris} ekskl. moms.
          Har du spørgsmål, så skriv til <a href="mailto:support@birdly.dk">support@birdly.dk</a>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ color: NAVY, fontSize: 26, marginBottom: 6 }}>Forny dit abonnement</h1>
      <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, marginTop: 0 }}>
        {data.firma ? <>Velkommen tilbage, <b style={{ color: NAVY }}>{data.firma}</b>. </> : null}
        Vælg din plan, så finder vi igen opgaver til dig.
      </p>

      {/* ⚠️ ÆRLIGHED OM PRØVEN. Har CVR'et haft en gratis prøve inden for 12
          måneder, betaler hun fra dag 1 — og det skal stå FØR hun vælger, ikke
          som en overraskelse bagefter. */}
      {data.uden_proeve && (
        <div style={{ background: "#FFF9E8", border: "1px solid #E8D08A", borderRadius: 10, padding: "12px 14px", margin: "0 0 20px", color: NAVY, fontSize: 14.5, lineHeight: 1.6 }}>
          Du har allerede haft en gratis prøveperiode inden for det seneste år, så
          abonnementet starter med det samme — der er ingen nye gratis dage.
        </div>
      )}

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {Object.entries(data.planer).map(([key, p]) => (
          <label key={key} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            border: "1px solid " + (plan === key ? "#1E9E8A" : "#DCE3EC"),
            background: plan === key ? "#F1FAF8" : "#fff",
            borderRadius: 12, cursor: "pointer",
          }}>
            <input type="radio" name="plan" value={key} checked={plan === key} onChange={() => setPlan(key)} />
            <span style={{ color: NAVY, fontWeight: 700 }}>{p.navn}</span>
            <span style={{ marginLeft: "auto", color: NAVY }}>{p.pris} <span style={{ color: MUTED, fontSize: 13 }}>ekskl. moms</span></span>
          </label>
        ))}
      </div>

      {/* ⚠️ PÅKRÆVET, OG VERIFICERES SERVER-SIDE. Fluebenet her er en visning;
          serveren afviser en anmodning uden det. At fortsætte er en
          aftaleindgåelse og må ikke kunne ske ved et uheld. */}
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18, color: NAVY, fontSize: 14.5, lineHeight: 1.6 }}>
        <input type="checkbox" checked={samtykke} onChange={(e) => setSamtykke(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          Jeg accepterer Birdlys{" "}
          <Link href="/abonnementsbetingelser" target="_blank">abonnementsbetingelser</Link> og{" "}
          <Link href="/handelsbetingelser" target="_blank">handelsbetingelser</Link>.
        </span>
      </label>

      {fejl && <div style={{ color: "#B03A3A", marginBottom: 14, fontSize: 14.5 }}>{fejl}</div>}

      <button style={{ ...KNAP, opacity: !samtykke || sender ? 0.55 : 1 }}
        disabled={!samtykke || sender} onClick={send}>
        {sender ? "Sender …" : data.kort_live ? "Gå til betaling" : "Forny abonnement"}
      </button>

      {!data.kort_live && (
        <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6, marginTop: 14 }}>
          Vi sender dig et fornyelseslink pr. mail — der trækkes ingen penge her.
        </p>
      )}
    </main>
  );
}
