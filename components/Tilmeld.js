"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { insertRow } from "../lib/supabase";
import "../app/tilmeld.css";

const fag = [
  "Murer", "Tømrer", "Elektriker", "VVS", "Maler", "Anlægsgartner",
  "Kloak & anlæg", "Brolægger", "Tagdækker", "Smed", "Glarmester",
  "Rengøring", "IT & web", "Vinduespudser", "Maskinstation", "Snedker",
  "Transport", "Catering", "Vagt & sikring", "Gulvlægger",
];

const bands = ["0 kr.", "100.000 kr.", "250.000 kr.", "500.000 kr.", "1 mio. kr.", "2,5 mio. kr.", "10 mio. kr.", "25 mio. kr.", "50+ mio. kr."];
const maxBands = ["100.000 kr.", "250.000 kr.", "500.000 kr.", "1 mio. kr.", "2,5 mio. kr.", "10 mio. kr.", "25 mio. kr.", "50 mio. kr.", "Ingen øvre grænse"];

export default function Tilmeld() {
  const [fagSel, setFagSel] = useState({});
  const [minIdx, setMinIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(5);
  const [plan, setPlan] = useState("eagle");
  const [pm, setPm] = useState("kort");
  const [ok1, setOk1] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const cvrRef = useRef(null);
  const firmaRef = useRef(null);
  const navnRef = useRef(null);
  const mailRef = useRef(null);
  const mobilRef = useRef(null);
  const regionRef = useRef(null);

  function toggleFag(f) {
    setFagSel((s) => ({ ...s, [f]: !s[f] }));
  }

  function onMin(v) {
    v = +v;
    setMinIdx(v);
    if (maxIdx < v) setMaxIdx(v);
  }
  function onMax(v) {
    v = +v;
    if (v < minIdx) v = minIdx;
    setMaxIdx(v);
  }

  // Dækning/område udledes af planen: Albatros = hele DK (intet valg),
  // Spurv/Falk = værdien fra region-select'en.
  function daekningFor(p) {
    if (p === "albatros") return "Hele Danmark";
    return regionRef.current?.value || null;
  }

  async function onSubmit() {
    const cvr = (cvrRef.current?.value || "").trim();
    const firma = (firmaRef.current?.value || "").trim();
    const navn = (navnRef.current?.value || "").trim();
    const mail = (mailRef.current?.value || "").trim();
    const mobil = (mobilRef.current?.value || "").trim();
    const fagListe = fag.filter((f) => fagSel[f]);
    if (cvr.length !== 8) { alert("Skriv et gyldigt CVR-nummer (8 cifre)."); return; }
    if (!mail || !mobil) { alert("Udfyld email og mobilnummer."); return; }
    if (fagListe.length === 0) { alert("Vælg mindst ét fag, så vi ved, hvad vi skal matche dig med."); return; }
    if (!ok1) { alert("Sæt venligst flueben i samtykke."); return; }
    if (saving) return;

    // Rå tilmeldingsdata (plan/dækning/fag/beløb) i signup_data (jsonb).
    // Admin (service-key) provisionerer match_settings/subscription herfra.
    const signup_data = {
      plan,
      dækning: daekningFor(plan),
      fag: fagListe,
      beløb: {
        min_label: bands[minIdx],
        max_label: maxBands[maxIdx],
        min_idx: minIdx,
        max_idx: maxIdx,
      },
    };

    setSaving(true);
    try {
      // status='trial' + ingen billing_customer_id => opfylder anon-RLS-policyen.
      // insertRow bruger return=minimal, så rækken læses ikke tilbage.
      await insertRow("subscribers", {
        cvr,
        company_name: firma || null,
        contact_name: navn || null,
        email: mail,
        phone: mobil,
        status: "trial",
        signup_data,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(
        "Ups — vi kunne ikke gemme din tilmelding lige nu. Prøv igen om lidt, " +
        "eller skriv til support@birdly.dk.\n\n(" + (err?.message || "ukendt fejl") + ")"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="birdly-tilmeld">
      <header>
        <div className="bar">
          <Link href="/" className="logo">
            <svg width="30" height="26" viewBox="0 0 48 40" fill="none"><defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#0D1B2A" /><stop offset=".45" stopColor="#2EB7FF" /><stop offset="1" stopColor="#9BDCFF" /></linearGradient></defs><path d="M4 31 Q24 27 46 6 Q27 15 9 27 Z" fill="url(#wg)" /><path d="M6 35 Q22 32 39 18 Q25 23 11 31 Z" fill="url(#wg)" opacity=".8" /></svg>
            <span>Birdly<span className="dk">.dk</span></span>
          </Link>
          <Link href="/" className="back">← Tilbage til forsiden</Link>
        </div>
      </header>

      <div className="top">
        <span className="ey">🐦 Gratis i 14 dage — ingen binding</span>
        <h1>Opret din profil</h1>
        <p>Jo mere præcist du udfylder, jo bedre match. Vi bruger oplysningerne til kun at sende dig udbud, der rent faktisk passer til din virksomhed.</p>
      </div>

      <div className="wrap">
        <div className="card" id="formCard" style={submitted ? { display: "none" } : undefined}>

          {/* 1: Virksomhed */}
          <div className="sec">
            <div className="h"><span className="n">1</span><h3>Din virksomhed</h3></div>
            <p className="sub">Vi henter automatisk dit fag og område fra dit CVR — du bekræfter bagefter.</p>
            <div className="grid2">
              <div className="fg"><label htmlFor="cvr">CVR-nummer</label><input id="cvr" ref={cvrRef} inputMode="numeric" maxLength={8} placeholder="12345678" /></div>
              <div className="fg"><label htmlFor="firma">Virksomhedsnavn</label><input id="firma" ref={firmaRef} placeholder="Firma ApS" /></div>
              <div className="fg"><label htmlFor="navn">Kontaktperson</label><input id="navn" ref={navnRef} placeholder="Fornavn Efternavn" /></div>
              <div className="fg"><label htmlFor="mail">Email</label><input id="mail" ref={mailRef} type="email" placeholder="dig@firma.dk" /></div>
              <div className="fg"><label htmlFor="mobil">Mobilnummer (til SMS)</label><input id="mobil" ref={mobilRef} type="tel" placeholder="12 34 56 78" /></div>
            </div>
          </div>

          {/* 2: Fag */}
          <div className="sec">
            <div className="h"><span className="n">2</span><h3>Dit fag og dine ydelser</h3></div>
            <p className="sub">Vælg de fag og ydelser, du reelt byder på.</p>
            <div className="chk-grid" id="fagGrid">
              {fag.map((f) => (
                <label className={"chk" + (fagSel[f] ? " on" : "")} key={f}>
                  <input type="checkbox" value={f} checked={!!fagSel[f]} onChange={() => toggleFag(f)} /> {f}
                </label>
              ))}
            </div>
            <div className="note"><b>Bemærk:</b> Jo flere fag du vælger, jo flere udbud sender vi. Vælger du for bredt, kan du få udbud uden for dit speciale — vælger du for snævert, går du måske glip af opgaver. Vælg det, der matcher din hverdag. Du kan altid justere det senere.</div>
          </div>

          {/* 3: Plan */}
          <div className="sec">
            <div className="h"><span className="n">3</span><h3>Vælg din plan</h3></div>
            <p className="sub">Planen bestemmer, hvor stort et geografisk område vi matcher dig i.</p>
            <div className="plans">
              <label className={"plan" + (plan === "spurv" ? " on" : "")} data-plan="spurv"><input type="radio" name="plan" value="spurv" checked={plan === "spurv"} onChange={() => setPlan("spurv")} />
                <div className="nm">Spurv</div><div className="pr">349<span> kr./md</span></div><div className="ds">Udbud i én region, du selv vælger.</div></label>
              <label className={"plan" + (plan === "eagle" ? " on" : "")} data-plan="eagle"><input type="radio" name="plan" value="eagle" checked={plan === "eagle"} onChange={() => setPlan("eagle")} /><span className="feat">MEST POPULÆRE</span>
                <div className="nm">Falk</div><div className="pr">499<span> kr./md</span></div><div className="ds">Alle regioner vest eller øst for Storebælt.</div></label>
              <label className={"plan" + (plan === "albatros" ? " on" : "")} data-plan="albatros"><input type="radio" name="plan" value="albatros" checked={plan === "albatros"} onChange={() => setPlan("albatros")} />
                <div className="nm">Albatros</div><div className="pr">1.199<span> kr./md</span></div><div className="ds">Udbud i hele Danmark.</div></label>
            </div>
            <div className="fg" id="regionWrap" style={{ marginTop: 16 }}>
              {plan === "spurv" && (
                <>
                  <label htmlFor="region">Vælg din region</label>
                  <select id="region" ref={regionRef} defaultValue="Region Hovedstaden">
                    <option>Region Hovedstaden</option>
                    <option>Region Sjælland</option>
                    <option>Region Syddanmark</option>
                    <option>Region Midtjylland</option>
                    <option>Region Nordjylland</option>
                  </select>
                </>
              )}
              {plan === "eagle" && (
                <>
                  <label htmlFor="region">Vælg din side af Storebælt</label>
                  <select id="region" ref={regionRef} defaultValue="Øst for Storebælt (Hovedstaden + Sjælland)">
                    <option>Øst for Storebælt (Hovedstaden + Sjælland)</option>
                    <option>Vest for Storebælt (Syd-, Midt- &amp; Nordjylland)</option>
                  </select>
                </>
              )}
              {plan === "albatros" && (
                <div className="note" style={{ marginTop: 0 }}>Med <b>Albatros</b> matcher vi dig i <b>hele Danmark</b> — du behøver ikke vælge område.</div>
              )}
            </div>
          </div>

          {/* 4: Opgavestørrelse */}
          <div className="sec">
            <div className="h"><span className="n">4</span><h3>Opgavestørrelse</h3></div>
            <p className="sub">Træk i skyderne for at vælge det interval, din virksomhed kan løfte.</p>
            <div className="grid2">
              <div>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Mindste opgave</label>
                <div className="slider-val" id="minVal">{bands[minIdx]}</div>
                <input type="range" id="minRange" min="0" max="8" step="1" value={minIdx} onChange={(e) => onMin(e.target.value)} />
                <div className="range-ends"><span>0 kr.</span><span>50+ mio.</span></div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Største opgave</label>
                <div className="slider-val" id="maxVal">{maxBands[maxIdx]}</div>
                <input type="range" id="maxRange" min="0" max="8" step="1" value={maxIdx} onChange={(e) => onMax(e.target.value)} />
                <div className="range-ends"><span>0 kr.</span><span>Ingen grænse</span></div>
              </div>
            </div>
            <div className="note warn"><b>Vigtigt:</b> Sætter du beløbet for snævert, får du måske få eller ingen match. Sætter du det for bredt, kan du få store udbud på fx 250 mio. kr., som en mindre virksomhed ikke kan løfte. Vælg det interval, I realistisk kan byde på — det giver de bedste og mest relevante match.</div>
          </div>

          {/* 5: Betaling */}
          <div className="sec">
            <div className="h"><span className="n">5</span><h3>Betaling</h3></div>
            <p className="sub">Du betaler <b>intet i dag</b>. Vi gemmer din betalingsmetode, så dit abonnement starter automatisk, når de 14 gratis dage er gået.</p>
            {/* BETALING: placeholder. Etape 4 monterer Stripe Payment Element i #stripeElement.
                GATEWAY-VALG (afgør recurring for MobilePay):
                - MobilePay Subscriptions ("Faste aftaler") understøtter recurring MobilePay — fås via fx Quickpay.
                - Stripes EGEN MobilePay-metode er single-use; via Stripe køres recurring på kort/Apple Pay/Google Pay/Link.
                Beslut gateway før integration. */}
            <div className="pay-methods">
              <button type="button" className={"pm-tab" + (pm === "kort" ? " on" : "")} data-pm="kort" onClick={() => setPm("kort")}>💳 Kort</button>
              <button type="button" className={"pm-tab" + (pm === "apple" ? " on" : "")} data-pm="apple" onClick={() => setPm("apple")}> Apple Pay</button>
              <button type="button" className={"pm-tab" + (pm === "google" ? " on" : "")} data-pm="google" onClick={() => setPm("google")}>G Pay</button>
              <button type="button" className={"pm-tab" + (pm === "mobilepay" ? " on" : "")} data-pm="mobilepay" onClick={() => setPm("mobilepay")}>MobilePay</button>
            </div>
            <div className="pay-element" id="stripeElement">
              <svg width="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#2EB7FF" strokeWidth="1.8" /><path d="M2 9h20" stroke="#2EB7FF" strokeWidth="1.8" /></svg>
              Sikkert betalingsfelt (Stripe) vises her
            </div>
            <div className="note">Betal med <b>kort, Apple Pay, Google Pay eller MobilePay</b>. Du godkender aftalen én gang — derefter fornyes dit abonnement automatisk, og du kan opsige når som helst.</div>
            <div className="pay-secure">
              <svg width="15" viewBox="0 0 24 24" fill="none"><path d="M6 11V8a6 6 0 0112 0v3" stroke="#5A6678" strokeWidth="1.8" /><rect x="4" y="11" width="16" height="10" rx="2" stroke="#5A6678" strokeWidth="1.8" /></svg>
              Betaling håndteres sikkert af Stripe. Dine kortoplysninger rører aldrig Birdlys servere.
            </div>
          </div>

          {/* Det får du */}
          <div className="sec">
            <div className="expect">
              <h4><svg width="20" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#7FD0FF" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#7FD0FF" strokeWidth="2.4" strokeLinecap="round" /></svg> Sådan arbejder Birdly for dig</h4>
              <p>Vi finder de mest konkrete match ud fra dine oplysninger og din virksomheds ydelser. Så snart der er et aktuelt udbud, der passer, hører du fra os:</p>
              <ul>
                <li><svg viewBox="0 0 20 20" width="20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> En <b style={{ color: "#fff" }}>SMS</b> med det samme, når der er et match.</li>
                <li><svg viewBox="0 0 20 20" width="20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> En <b style={{ color: "#fff" }}>mail</b> med et kort resumé af opgaven, dato/frist og et direkte link til udbuddet.</li>
              </ul>
            </div>
          </div>

          {/* 6: Betaling + samtykke */}
          <div className="billing">
            <svg viewBox="0 0 24 24" width="20" fill="none"><circle cx="12" cy="12" r="9" stroke="#B58A2E" strokeWidth="1.8" /><path d="M12 8v5M12 16h.01" stroke="#B58A2E" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <div>Når din gratis prøveperiode på <b>14 dage</b> udløber, fortsætter dit abonnement automatisk på den valgte plan. Beløbet trækkes den <b>1. i hver måned</b>. Du kan opsige når som helst.</div>
          </div>

          <label className="consent"><input type="checkbox" id="ok1" checked={ok1} onChange={(e) => setOk1(e.target.checked)} /> Jeg accepterer <Link href="/handelsbetingelser" style={{ color: "var(--sky)", fontWeight: 600 }}>handelsbetingelser</Link> og <Link href="/privatlivspolitik" style={{ color: "var(--sky)", fontWeight: 600 }}>privatlivspolitik</Link>, og at SMS og mail er en del af tjenesten.</label>

          <button type="button" className="submit" id="go" onClick={onSubmit} disabled={saving}>{saving ? "Sender …" : "Opret Birdly nu – gratis de første 14 dage →"}</button>
          <div className="trust">
            <span>✓ Gratis de første 14 dage</span><span>✓ Ingen binding</span><span>✓ Opsig med 30 dages varsel</span>
          </div>
        </div>

        <div className={"card ok" + (submitted ? " show" : "")} id="okMsg">
          <div className="ck"><svg viewBox="0 0 24 24" width="30"><path d="M5 13l4 4 10-11" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <h2>Velkommen til Birdly!</h2>
          <p>Vi bekræfter dit fag og område og begynder at holde øje for dig. Du hører fra os på SMS og mail, så snart der er et match.</p>
        </div>
      </div>

      <p className="disclaimer">
        Birdly leverer udelukkende data fra de to officielle platforme, der anvendes til offentlige og statslige udbud i Danmark (udbud.dk og EU's TED-database). Vi er en formidlingstjeneste, der sender relevant udbudsdata fra kilde til bruger. Et match er en henvisning til et offentligt udbud — ikke en garanti for, at din virksomhed opfylder udbuddets krav. Birdly kan ikke holdes ansvarlig for indholdet eller korrektheden af de enkelte udbud, herunder eventuelle krav og betingelser, som det til enhver tid er den enkelte virksomheds eget ansvar at vurdere og opfylde.
      </p>
    </div>
  );
}
