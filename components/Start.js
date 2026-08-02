"use client";

import { useEffect, useMemo, useState } from "react";
import { Logo } from "./Logo";
import { fetchCatalog, submitSignup, createSubscriptionSession } from "../lib/catalog";
import { hentKandidater, visResultat } from "../lib/kandidater";
import { planForInterval, priceText } from "../lib/pakke";
// ⚠️ forside.css importeres IKKE. Den er nested under `.birdly-home`, så dens
// klasser virker alligevel ikke her — og importen ville kun sende hele forsidens
// CSS med i bundlen uden at gøre noget. start.css bærer det vi bruger.
import "../app/start.css";

// ============================================================================
// /start — den korte onboarding. Fire skærme, ét spørgsmål ad gangen.
//
// ⚠️ DEN GAMLE FUNNEL (/tilmeld) RØRES IKKE. Den bærer alle 14 SEO-links og er
// den eneste beviste vej til betaling. Denne kører ved siden af, så de to kan
// sammenlignes, og CTA'erne flyttes først når denne har vist sig bedre.
//
// ⚠️ INGEN NY SIGNUP. Trin 4 kalder den EKSISTERENDE `signup` Edge Function med
// samme payload-form som /tilmeld. Alle værn ligger dér og er den eneste
// flaskehals der ikke kan omgås: nul-dækning, dublet-CVR/telefon, min>max,
// betal-straks ved opbrugt prøve. Byg aldrig en genvej udenom.
//
// ⚠️ TALLET I TRIN 3 ER ÆGTE. Det kommer fra preview-kandidater, som bruger selve
// match-reglen. Er der 0 i kundens område, vises landstallet SOM landstal — aldrig
// som om det lå i hendes område. Se visResultat() i lib/kandidater.js.
// ============================================================================

// ⚠️ FEM TRIN, IKKE FIRE (02-08-2026). Arbejdsområderne og bredde-valget manglede
// helt: /start sendte fagets fulde kodesæt med `bredde: "alle"` hardkodet. Det gav
// et gyldigt kriterium — men det BREDEST mulige, uden nogen vej ud.
//
// Målt på entreprenør, hele landet:
//   alle områder + "alle"          11 koder → 79 opgaver
//   alle områder + "kun fag"       10 koder → 47
//   kun betonarbejder + "alle"      2 koder → 79   ← samme som at vælge alt
//   kun betonarbejder + "kun fag"   1 kode  →  2
//
// `bredde` er altså hele indsnævringen: med "alle" lægges fagets brede kode på, og
// den alene rammer 79. En betonspecialist fik præcis samme liste som en der laver
// alt — og ville systematisk ramme "for mange opgaver" i fravalgs-widgeten.
//
// Det er sit eget trin frem for at proppes ind i trin 2: et fag som entreprenør har
// 10 underområder, og de + fag + område + beløb på én mobilskærm er ikke ét
// spørgsmål ad gangen længere.
const TRIN = ["CVR", "Fag og område", "Arbejdsområder", "Resultat", "Betaling"];
const ANTAL_TRIN = TRIN.length;

// Samme SDK-indlæsning som /tilmeld. ⚠️ Bevidst duplikeret frem for at refaktorere
// den live betalingssti midt i en ny funnel: Tilmeld.js er den eneste kanal der
// tager imod penge i dag. Når /start er bevist, lægges de to sammen i én komponent
// — det er noteret som opfølgning, ikke glemt.
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

const cifre = (s) => String(s || "").replace(/\D/g, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Telefon → +45XXXXXXXX. Samme antagelse som funnelen og signup: et 8-cifret
// dansk nummer uden landekode får +45.
function tilE164(raa) {
  const d = cifre(raa);
  if (!d) return null;
  if (d.length === 8) return "+45" + d;
  if (d.startsWith("45") && d.length === 10) return "+" + d;
  if (d.startsWith("0045")) return "+" + d.slice(2);
  return d.length >= 8 ? "+" + d : null;
}

export default function Start({ startFag = null }) {
  const [trin, setTrin] = useState(1);
  const [katalog, setKatalog] = useState(null);
  const [fejl, setFejl] = useState("");
  const [arbejder, setArbejder] = useState(false);

  // Trin 1
  const [cvr, setCvr] = useState("");
  const [firma, setFirma] = useState("");
  const [branchekode, setBranchekode] = useState(null);
  const [slaarOp, setSlaarOp] = useState(false);
  const [opslagFejl, setOpslagFejl] = useState("");

  // Trin 2
  const [fag, setFag] = useState(startFag || "");
  const [region, setRegion] = useState("hele_dk");
  const [maks, setMaks] = useState("");

  // Trin 3 — arbejdsområder + bredde. Samme to valg som /tilmeld, samme datakilde
  // (katalogets fag.smal) og samme mapping til CPV. Ingen opfundne værdier.
  const [omraadeValg, setOmraadeValg] = useState({}); // { [cpv]: true }
  // "Alle brede opgaver" er default og anbefalet — samme forvalg som /tilmeld.
  const [bredde, setBredde] = useState("alle");

  // Trin 3
  const [kandidater, setKandidater] = useState(null);
  const [henter, setHenter] = useState(false);
  const [navn, setNavn] = useState("");
  const [email, setEmail] = useState("");
  const [tlf, setTlf] = useState("");

  // Trin 4
  const [betingelser, setBetingelser] = useState(false);
  const [interval, setInterval_] = useState("monthly");
  const [sessionId, setSessionId] = useState(null);
  const [oprettetId, setOprettetId] = useState(null);
  const [udenProeve, setUdenProeve] = useState(false);
  const [betalingAaben, setBetalingAaben] = useState(false);
  const [faerdig, setFaerdig] = useState(false);

  useEffect(() => { fetchCatalog().then(setKatalog).catch(() => setKatalog({ fag: [], regions: [] })); }, []);

  const fagListe = katalog?.fag || [];
  const valgtFag = useMemo(() => fagListe.find((f) => f.key === fag) || null, [fagListe, fag]);

  // Fagets underområder, ordret fra kataloget — samme kilde /tilmeld bruger.
  const omraader = useMemo(() => valgtFag?.smal || [], [valgtFag]);

  // ⚠️ KODERNE SKAL MED. Sender vi kun fag_keys, får de 13 fag uden bred kode
  // effektive_koder=0 og dermed 0 opgaver — ikke fordi der intet er, men fordi
  // intet var valgt. Det er kundens afkrydsninger der bliver til cpv_selections.
  const fagKoder = useMemo(
    () => omraader.map((a) => a.cpv).filter((c) => c && omraadeValg[c]),
    [omraader, omraadeValg]
  );

  // Når faget skifter, krydses ALLE fagets områder af. Bevidst forvalg: det svarer
  // til "Tag alle X-områder med" i /tilmeld og gør at en kunde der bare trykker
  // videre får et gyldigt, bredt kriterium frem for et tomt. Hun kan fravælge —
  // og det er netop dét valg der manglede.
  useEffect(() => {
    const n = {};
    for (const a of omraader) if (a.cpv) n[a.cpv] = true;
    setOmraadeValg(n);
  }, [omraader]);

  const alleValgt = omraader.length > 0 && omraader.every((a) => omraadeValg[a.cpv]);
  function saetAlle(paa) {
    const n = {};
    for (const a of omraader) if (a.cpv) n[a.cpv] = paa;
    setOmraadeValg(n);
  }

  // ---- Trin 1: CVR-opslag ----
  async function slaaOp(vaerdi) {
    const d = cifre(vaerdi);
    if (d.length !== 8) return;
    setSlaarOp(true); setOpslagFejl("");
    try {
      const r = await fetch(`/api/cvr?cvr=${d}`).then((x) => x.json());
      if (r?.name) {
        setFirma(r.name);
        setBranchekode(r.branchekode || null);
        // Branchekoden gætter faget, så trin 2 bliver en bekræftelse frem for et valg.
        // Gætter den forkert, retter kunden det selv — derfor er det kun et forvalg.
        // ⚠️ branchekode_fag giver en LISTE af fag-nøgler, ikke én. Vi tager den
        // første som forvalg; resten står i dropdownen.
        const gaet = (katalog?.branchekode_fag || {})[r.branchekode];
        const foerste = Array.isArray(gaet) ? gaet[0] : gaet;
        if (foerste && !fag) setFag(foerste);
      } else {
        setOpslagFejl("Vi kunne ikke finde firmaet. Du kan fortsætte alligevel.");
      }
    } catch {
      setOpslagFejl("Vi kunne ikke slå CVR op lige nu. Du kan fortsætte alligevel.");
    } finally { setSlaarOp(false); }
  }

  // ---- Trin 3 → 4: hent det ægte tal ----
  // ⚠️ Tallet regnes på den FULDE effektive liste — kundens afkrydsede områder OG
  // hendes bredde-valg. Regnede vi før hun havde valgt, ville trin 4 vise et tal
  // der ikke svarer til det hun får.
  async function tilResultat() {
    setFejl("");
    if (!fag) return setFejl("Vælg dit fag.");
    if (!fagKoder.length) return setFejl("Vælg mindst ét arbejdsområde — det er dem, vi holder øje med.");
    setHenter(true); setTrin(4);
    const k = await hentKandidater({
      fag_keys: [fag],
      cpv_selections: fagKoder,
      bredde,
      region_keys: [region],
      min_amount: null,
      max_amount: maks ? Number(maks) : null,
    });
    setKandidater(k); setHenter(false);
  }

  // ---- Trin 4 → 5: opret kunden + betalingssession ----
  async function tilBetaling() {
    setFejl("");
    if (!navn.trim()) return setFejl("Skriv dit navn.");
    if (!EMAIL_RE.test(email.trim())) return setFejl("Skriv en gyldig e-mail.");
    if (!tilE164(tlf)) return setFejl("Skriv et gyldigt telefonnummer.");
    if (!betingelser) return setFejl("Sæt flueben i betingelserne for at fortsætte.");
    if (arbejder) return;
    setArbejder(true);
    try {
      let id = oprettetId;
      // ⚠️ Lokal variabel, ikke state: setUdenProeve er asynkron, og den FØRSTE
      // session for en genkommende kunde ville ellers blive oprettet MED gratis
      // prøve — præcis det misbrug værnet skal forhindre. Samme greb som /tilmeld.
      let udenProeveNu = udenProeve;
      if (!id) {
        const r = await submitSignup({
          company_name: firma.trim() || null,
          cvr: cifre(cvr),
          contact_name: navn.trim(),
          email: email.trim(),
          phone: tilE164(tlf),
          fag_keys: [fag],
          cpv_selections: fagKoder,
          bredde,
          region_keys: [region],
          min_amount: null,
          max_amount: maks ? Number(maks) : null,
          notify_email: true,
          notify_sms: true,
          marketing_consent: false,
          terms_accepted: true,
          cvr_branchekode: branchekode,
          package: planForInterval(interval),
        });
        id = r.id;
        setOprettetId(id);
        if (r.uden_proeve) { udenProeveNu = true; setUdenProeve(true); }
      }
      const { session_id } = await createSubscriptionSession({
        subscriber_id: id,
        email: email.trim(),
        contact_name: navn.trim(),
        phone: tilE164(tlf),
        billing: interval,
        reuse_customer: false,
        uden_proeve: udenProeveNu,
      });
      setSessionId(session_id);
      setTrin(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      // Værnene i signup svarer med almindeligt dansk — vis det ordret frem for at
      // oversætte det til noget mere generelt. "Vælg mindst ét arbejdsområde" og
      // "dette CVR er allerede oprettet" er begge beskeder kunden kan handle på.
      setFejl(e.message || "Noget gik galt. Prøv igen, eller skriv til support@birdly.dk.");
    } finally { setArbejder(false); }
  }

  function aabnBetaling() {
    if (!sessionId || arbejder) return;
    setFejl(""); setBetalingAaben(true);
    loadReepay()
      .then((Reepay) => {
        const rp = new Reepay.EmbeddedSubscription(sessionId, { html_element: "start-betalingsboks" });
        rp.addEventHandler(Reepay.Event.Accept, () => setFaerdig(true));
        rp.addEventHandler(Reepay.Event.Error, () => setFejl("Betalingen kunne ikke gennemføres. Prøv igen."));
        rp.addEventHandler(Reepay.Event.Cancel, () => setBetalingAaben(false));
        rp.addEventHandler(Reepay.Event.Close, () => setBetalingAaben(false));
      })
      .catch((e) => { setBetalingAaben(false); setFejl(e.message); });
  }

  // ⚠️ priceText er et OBJEKT, ikke en funktion — og det er den eneste kilde til
  // beløbet. Hardkod aldrig en pris her; det var netop derfor tre steder stod med
  // den gamle pris efter en ændring (se CLAUDE.md, "Pris — REGLERNE").
  const pris = priceText[interval];

  if (faerdig) {
    return (
      <main className="st-wrap">
        <div className="st-top"><Logo height={30} /></div>
        <div className="st-kort st-kvit">
          <div className="st-ic">✓</div>
          <h1>Jeres profil er klar.</h1>
          <p>Vi holder øje fra nu af. I får en SMS og en mail, så snart der er en opgave der passer til jer.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="st-wrap">
      <div className="st-top"><Logo height={30} /></div>

      <div className="st-bar" aria-label={`Trin ${trin} af ${ANTAL_TRIN}`}>
        <i style={{ width: `${(trin / ANTAL_TRIN) * 100}%` }} />
      </div>
      <p className="st-trin">Trin {trin} af {ANTAL_TRIN} · {TRIN[trin - 1]}</p>

      {fejl && <div className="st-fejl">{fejl}</div>}

      {/* ---------------- TRIN 1 — CVR ---------------- */}
      {trin === 1 && (
        <div className="st-kort">
          <h1>Hvad er jeres CVR-nummer?</h1>
          <p className="st-hj">Så henter vi resten selv.</p>
          <label className="st-lab" htmlFor="cvr">CVR-nummer</label>
          <input
            id="cvr" className="st-felt" inputMode="numeric" autoComplete="off" maxLength={11}
            value={cvr}
            onChange={(e) => { setCvr(e.target.value); setFirma(""); setOpslagFejl(""); }}
            onBlur={(e) => slaaOp(e.target.value)}
            placeholder="12345678"
          />
          {slaarOp && <p className="st-hj">Slår op…</p>}
          {firma && (
            <div className="st-hit">
              ✓ <b>{firma}</b>
              {valgtFag && <><br /><span>Ser ud til at være <b>{valgtFag.label_da}</b></span></>}
            </div>
          )}
          {opslagFejl && <p className="st-hj">{opslagFejl}</p>}
          <button className="btn btn-teal st-bred" onClick={() => { if (cifre(cvr).length !== 8) return setFejl("Skriv et CVR-nummer på 8 cifre."); setFejl(""); setTrin(2); }}>
            Fortsæt →
          </button>
        </div>
      )}

      {/* ---------------- TRIN 2 — FAG + OMRÅDE ---------------- */}
      {trin === 2 && (
        <div className="st-kort">
          <h1>Hvad laver I, og hvor?</h1>
          <p className="st-hj">Det er det, vi holder øje efter.</p>

          <label className="st-lab" htmlFor="fag">Fag</label>
          <select id="fag" className="st-felt" value={fag} onChange={(e) => setFag(e.target.value)}>
            <option value="">Vælg fag…</option>
            {fagListe.map((f) => <option key={f.key} value={f.key}>{f.label_da}</option>)}
          </select>

          <label className="st-lab" htmlFor="omr">Område</label>
          <select id="omr" className="st-felt" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="hele_dk">Hele Danmark</option>
            {(katalog?.regions || []).map((r) => <option key={r.key} value={r.key}>{r.label_da}</option>)}
          </select>

          <label className="st-lab" htmlFor="maks">Største opgave I vil se <span className="st-valgfri">(valgfrit)</span></label>
          <select id="maks" className="st-felt" value={maks} onChange={(e) => setMaks(e.target.value)}>
            <option value="">Alle beløb</option>
            <option value="1000000">Op til 1 mio. kr.</option>
            <option value="5000000">Op til 5 mio. kr.</option>
            <option value="20000000">Op til 20 mio. kr.</option>
          </select>

          <button
            className="btn btn-teal st-bred"
            onClick={() => { if (!fag) return setFejl("Vælg dit fag."); setFejl(""); setTrin(3); }}
          >
            Fortsæt →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(1)}>← Tilbage</button>
        </div>
      )}

      {/* ---------------- TRIN 3 — ARBEJDSOMRÅDER + BREDDE ---------------- */}
      {/* Samme to valg som /tilmeld, samme datakilde (katalogets fag.smal) og samme
          mapping til CPV. Det er dem der bliver til søgekriteriet — ikke pynt. */}
      {trin === 3 && (
        <div className="st-kort">
          <h1>Hvad laver I helt præcis?</h1>
          <p className="st-hj">Kryds det fra I ikke laver. Så slipper I for beskeder om det.</p>

          {omraader.length > 0 ? (
            <>
              <div className="st-omrhoved">
                <span className="st-lab" style={{ margin: 0 }}>Dine arbejdsområder</span>
                <button type="button" className="st-alle" onClick={() => saetAlle(!alleValgt)}>
                  {alleValgt ? "Fjern alle" : `Tag alle ${valgtFag?.label_da || "områder"} med`}
                </button>
              </div>
              <div className="st-omr">
                {omraader.map((a) => (
                  <label key={a.cpv} className={"st-omrk" + (omraadeValg[a.cpv] ? " on" : "")}>
                    <input
                      type="checkbox"
                      checked={!!omraadeValg[a.cpv]}
                      onChange={() => setOmraadeValg((s) => ({ ...s, [a.cpv]: !s[a.cpv] }))}
                    />
                    <span>
                      <b>{a.kunde_titel || a.name_da}</b>
                      {a.name_da && a.kunde_titel && <i>{a.name_da}</i>}
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <p className="st-hj">Dit fag har ingen underområder — I matches på fagets brede koder.</p>
          )}

          {/* ⚠️ BREDDE ER HELE INDSNÆVRINGEN. Med "alle" lægges fagets brede kode på,
              og den alene rammer 79 opgaver for entreprenør — uanset hvor få områder
              der er krydset af. Uden dette valg kan en specialist ikke komme ned. */}
          <div className="st-bredde">
            <span className="st-lab" style={{ margin: "0 0 8px" }}>Hvor bredt vil I fange opgaver?</span>
            <label className={"st-radio" + (bredde === "fag" ? " on" : "")}>
              <input type="radio" name="bredde" checked={bredde === "fag"} onChange={() => setBredde("fag")} />
              <span><b>Kun fagentrepriser</b><i>Færre, men kun de præcise områder I har valgt.</i></span>
            </label>
            <label className={"st-radio" + (bredde === "alle" ? " on" : "")}>
              <input type="radio" name="bredde" checked={bredde === "alle"} onChange={() => setBredde("alle")} />
              <span><b>Alle brede opgaver <em>anbefalet</em></b><i>Også de brede entrepriseudbud i jeres fag. Flere match, lidt mere bredt.</i></span>
            </label>
          </div>

          <button className="btn btn-teal st-bred" onClick={tilResultat}>Fortsæt →</button>
          <button className="st-tilbage" onClick={() => setTrin(2)}>← Tilbage</button>
        </div>
      )}

      {/* ---------------- TRIN 4 — ÆGTE TAL + KONTAKT ---------------- */}
      {trin === 4 && (
        <div className="st-kort">
          {henter ? (
            <><h1>Vi kigger efter…</h1><p className="st-hj">Et øjeblik.</p></>
          ) : (
            <>
              {visResultat(kandidater) === "lokalt" && (
                <>
                  <h1>Vi fandt noget til jer.</h1>
                  <div className="st-res">
                    <b>{kandidater.i_omraade}</b>
                    <span>{kandidater.i_omraade === 1 ? "opgave passer" : "opgaver passer"} til jer lige nu</span>
                  </div>
                </>
              )}

              {/* ⚠️ 0 I OMRÅDET. Landstallet står som landstal og udgiver sig ALDRIG
                  for at være i kundens område — og hun får en handling, ikke en trøst. */}
              {visResultat(kandidater) === "landsplan" && (
                <>
                  <h1>Vi holder øje for jer.</h1>
                  <div className="st-res st-nul">
                    <b>Ingen match i dit område lige nu</b>
                    <span>— men <b>{kandidater.paa_landsplan}</b> i dit fag på landsplan.</span>
                  </div>
                  <p className="st-hj">Prøv at udvide jeres område, eller lad os holde øje — så får I besked, så snart der kommer en.</p>
                  <button className="btn btn-ghost st-bred" onClick={() => setTrin(2)}>Udvid område</button>
                </>
              )}

              {visResultat(kandidater) === "intet" && (
                <>
                  <h1>Vi holder øje for jer.</h1>
                  <p className="st-hj">Der er ikke en opgave i jeres fag lige nu. Så snart der kommer en, får I besked på SMS og mail. I skal ikke gøre noget.</p>
                </>
              )}

              <label className="st-lab" htmlFor="navn">Navn</label>
              <input id="navn" className="st-felt" value={navn} onChange={(e) => setNavn(e.target.value)} autoComplete="name" />

              <label className="st-lab" htmlFor="mail">E-mail</label>
              <input id="mail" className="st-felt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

              <label className="st-lab" htmlFor="tlf">Mobilnummer <span className="st-valgfri">(det er her beskeden lander)</span></label>
              <input id="tlf" className="st-felt" inputMode="tel" value={tlf} onChange={(e) => setTlf(e.target.value)} autoComplete="tel" placeholder="12 34 56 78" />

              <label className="st-tjek">
                <input type="checkbox" checked={betingelser} onChange={(e) => setBetingelser(e.target.checked)} />
                <span>Jeg accepterer <a href="/handelsbetingelser" target="_blank" rel="noreferrer">handelsbetingelserne</a> og <a href="/privatlivspolitik" target="_blank" rel="noreferrer">privatlivspolitikken</a>.</span>
              </label>

              <button className="btn btn-teal st-bred" onClick={tilBetaling} disabled={arbejder}>
                {arbejder ? "Et øjeblik…" : "Fortsæt →"}
              </button>
              <button className="st-tilbage" onClick={() => setTrin(3)}>← Tilbage</button>
            </>
          )}
        </div>
      )}

      {/* ---------------- TRIN 5 — BETALING ---------------- */}
      {trin === 5 && (
        <div className="st-kort">
          <h1>0,00 kr. i dag.</h1>
          <p className="st-hj">
            14 dages gratis prøve. Første træk om 14 dage — {pris} ekskl. moms. Ingen binding.
          </p>

          <div className="st-plan">
            {[["monthly", "Måned"], ["yearly", "År"]].map(([k, l]) => (
              <button key={k} className={"st-planknap" + (interval === k ? " on" : "")} onClick={() => setInterval_(k)} disabled={!!sessionId}>
                {l}
              </button>
            ))}
          </div>

          <div className="st-garanti">
            <b>Matchgaranti</b>
            <p>Får du ingen match, betaler du ikke en krone.</p>
          </div>

          {!betalingAaben && (
            <button className="btn btn-teal st-bred" onClick={aabnBetaling} disabled={!sessionId}>
              Start min gratis prøve
            </button>
          )}
          {/* Containeren skal være i DOM'en FØR SDK'et monterer i den. */}
          <div id="start-betalingsboks" className={betalingAaben ? "st-boks" : "st-skjul"} />
          <p className="st-mini">0,00 kr. trækkes i dag. Du kan sige op når som helst i prøveperioden.</p>
        </div>
      )}
    </main>
  );
}
