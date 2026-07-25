"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { fetchMyTasks, previewCriteria, saveMyCriteria, undoMyCriteria, dismissTask } from "../lib/share";

// Samlesiden "Mine opgaver" (Spor 3b) — den side samle-SMS'en og -mailen peger på.
// Ingen login: kundens eget list_token er nøglen, og siden er LEVENDE (viser altid
// tilstanden nu, ikke da beskeden blev sendt).
//
// To dele:
//   1. Grundvisning — alle aktive opgaver, relevans-sorteret, med "Nyt"-badge.
//   2. "Sortér i opgaver" — 3 spørgsmål der ændrer kundens GEMTE kriterier, altså
//      hvad hun får fremover. Ikke et visningsfilter. Derfor: forhåndsvisning med
//      konsekvens FØR der gemmes, advarsel hvis svaret giver nul opgaver, og en
//      fortryd-knap der altid kan rulle tilbage.

const WRAP = { maxWidth: 820, margin: "0 auto", padding: "24px 18px 64px" };
const CARD = { background: "#fff", border: "1px solid #E6EAEF", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" };
const TEAL = "#1E9E8A";
const NAVY = "#1B2733";
const MUTED = "#6B7785";
const KNAP = { border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const KNAP_PRIMARY = { ...KNAP, background: TEAL, color: "#fff" };
const KNAP_SEKUNDAER = { ...KNAP, background: "#fff", color: NAVY, border: "1px solid #D7DDE5" };

const REGION_LABEL = {
  hovedstaden: "Hovedstaden",
  sjaelland: "Sjælland",
  syddanmark: "Syddanmark",
  midtjylland: "Midtjylland",
  nordjylland: "Nordjylland",
  hele_dk: "Hele landet",
};

// Beløbs-trin. Bevidst grove: det præcise standardloft afventer beløbsanalysen på
// rigtige danske under-tærskel-udbud. Forhåndsvisningen viser den FAKTISKE effekt af
// et trin, så kunden aldrig behøver gætte hvad et interval betyder for netop hende.
const BELOEB_TRIN = [
  { key: "alle", label: "Alle størrelser", hjaelp: "Du ser opgaver uanset beløb", min: null, max: null },
  { key: "under_1m", label: "Under 1 mio. kr.", hjaelp: "Mindre opgaver", min: null, max: 1000000 },
  { key: "1_10m", label: "1–10 mio. kr.", hjaelp: "Mellemstore opgaver", min: 1000000, max: 10000000 },
  { key: "over_10m", label: "Over 10 mio. kr.", hjaelp: "Store opgaver", min: 10000000, max: null },
];

function trinFraKriterier(k) {
  const match = BELOEB_TRIN.find((t) => t.min === (k.min_amount ?? null) && t.max === (k.max_amount ?? null));
  return match ? match.key : "alle";
}

function fmtDato(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
}
function dageTil(iso) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Number.isNaN(ms) ? null : Math.ceil(ms / 86400000);
}
function fmtBeloeb(amount, currency) {
  if (amount == null) return "Beløb ikke oplyst";
  return new Intl.NumberFormat("da-DK").format(Math.round(amount)) + (currency ? " " + currency : "");
}

// ---------------------------------------------------------------------------

export default function MineOpgaver({ token, data }) {
  const [opgaver, setOpgaver] = useState(data?.opgaver || []);
  const [kriterier, setKriterier] = useState(data?.kriterier || null);
  const [kanFortryde, setKanFortryde] = useState(!!data?.kan_fortryde);
  const [sortering, setSortering] = useState("relevans");
  const [panelAaben, setPanelAaben] = useState(false);
  const [besked, setBesked] = useState(null);

  const visteOpgaver = useMemo(() => {
    const kopi = [...opgaver];
    if (sortering === "frist") {
      kopi.sort((a, b) => String(a.deadline || "").localeCompare(String(b.deadline || "")));
    }
    return kopi; // "relevans" = serverens rækkefølge (smalle CPV-træf → egen region → frist)
  }, [opgaver, sortering]);

  const antalNye = opgaver.filter((o) => o.er_ny).length;

  // Ugyldigt/udløbet link — pæn tilstand, ingen detaljer lækket.
  if (!data || !data.found) {
    return (
      <main style={{ ...WRAP, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 28px" }}><Logo /></div>
        <div style={CARD}>
          <h1 style={{ fontSize: 22, margin: "4px 0 10px" }}>Linket er ugyldigt eller udløbet</h1>
          <p style={{ color: MUTED, lineHeight: 1.6 }}>
            {data?.expired
              ? "Dette link er udløbet. Skriv til os, så sender vi et nyt."
              : "Vi kunne ikke finde din liste. Tjek at du har kopieret hele linket fra din besked."}
          </p>
          <p style={{ marginTop: 18 }}>
            <Link href="https://birdly.dk" style={{ color: TEAL, fontWeight: 600 }}>Til birdly.dk</Link>
          </p>
        </div>
      </main>
    );
  }

  // Henter listen igen efter en kriterie-ændring. "Nyt"-badget bevares bevidst fra
  // den tilstand siden blev åbnet i: get-my-tasks registrerer et besøg ved hvert kald,
  // så en rå refetch ville nulstille badget midt i kundens session — hun ville se sine
  // nye opgaver holde op med at være markeret som nye, bare fordi hun sorterede.
  async function genindlaes() {
    const friske = await fetchMyTasks(token);
    if (!friske?.found) return;
    const varNy = new Set(opgaver.filter((o) => o.er_ny).map((o) => o.match_id));
    setOpgaver((friske.opgaver || []).map((o) => ({ ...o, er_ny: o.er_ny || varNy.has(o.match_id) })));
    setKriterier(friske.kriterier || null);
    setKanFortryde(!!friske.kan_fortryde);
  }

  async function haandterFortryd() {
    setBesked(null);
    const res = await undoMyCriteria(token);
    if (!res?.ok) {
      setBesked({ type: "fejl", tekst: res?.error === "intet_at_fortryde" ? "Der er ikke noget at fortryde." : "Kunne ikke fortryde. Prøv igen." });
      return;
    }
    await genindlaes();
    setBesked({ type: "ok", tekst: "Dine tidligere kriterier er gendannet." });
  }

  async function haandterFjern(matchId) {
    const res = await dismissTask(token, matchId, true);
    if (res?.ok) setOpgaver((prev) => prev.filter((o) => o.match_id !== matchId));
  }

  return (
    <main style={WRAP}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 22px" }}><Logo /></div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", color: NAVY }}>Mine opgaver</h1>
          <p style={{ margin: 0, color: MUTED }}>
            {data.customer?.company_name ? <>For <b style={{ color: NAVY }}>{data.customer.company_name}</b> · </> : null}
            {opgaver.length} {opgaver.length === 1 ? "aktiv opgave" : "aktive opgaver"}
            {antalNye > 0 ? <> · <b style={{ color: TEAL }}>{antalNye} nye siden sidst</b></> : null}
          </p>
        </div>
        <button type="button" style={KNAP_PRIMARY} onClick={() => setPanelAaben((v) => !v)}>
          {panelAaben ? "Luk" : "Sortér i opgaver"}
        </button>
      </div>

      {besked && (
        <div style={{ ...CARD, marginTop: 14, borderColor: besked.type === "fejl" ? "#F3C9C9" : "#BFE7DF", background: besked.type === "fejl" ? "#FDF4F4" : "#F1FAF8" }}>
          <p style={{ margin: 0, color: NAVY }}>{besked.tekst}</p>
        </div>
      )}

      {panelAaben && (
        <SorterPanel
          token={token}
          kriterier={kriterier}
          fag={data.fag || []}
          regioner={data.regioner || []}
          kanFortryde={kanFortryde}
          onFortryd={haandterFortryd}
          onGemt={async () => {
            setPanelAaben(false);
            await genindlaes();
            setBesked({ type: "ok", tekst: "Dine kriterier er opdateret — både her på listen og i de beskeder vi sender dig fremover." });
          }}
        />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "20px 0 12px", flexWrap: "wrap" }}>
        <span style={{ color: MUTED, fontSize: 14 }}>Sortér:</span>
        {[["relevans", "Mest relevante"], ["frist", "Frist først"]].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSortering(k)}
            style={{
              ...KNAP, padding: "7px 13px", fontSize: 14,
              background: sortering === k ? "#EAF6FF" : "#fff",
              color: sortering === k ? "#0D274A" : MUTED,
              border: `1px solid ${sortering === k ? "#B8DFF8" : "#E6EAEF"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {visteOpgaver.length === 0 ? (
        <div style={{ ...CARD, textAlign: "center" }}>
          <p style={{ margin: "6px 0", color: NAVY, fontWeight: 600 }}>Der er ingen aktive opgaver til dig lige nu.</p>
          <p style={{ margin: 0, color: MUTED, lineHeight: 1.6 }}>
            Vi kigger videre hver dag og sender dig besked, så snart der kommer et udbud der passer.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visteOpgaver.map((o) => (
            <OpgaveKort key={o.match_id} o={o} onFjern={() => haandterFjern(o.match_id)} />
          ))}
        </div>
      )}

      <p style={{ marginTop: 26, color: MUTED, fontSize: 13, lineHeight: 1.6 }}>
        Listen opdateres automatisk. Opgaver forsvinder herfra når fristen er overskredet.
        Kilde: TED (EU's udbudsdatabase). Birdly er ikke ordregiver — tjek altid det officielle udbudsmateriale.
      </p>
    </main>
  );
}

// ---------------------------------------------------------------------------

function OpgaveKort({ o, onFjern }) {
  const dage = dageTil(o.deadline);
  const haster = dage != null && dage <= 14;
  return (
    <div style={CARD}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        {o.er_ny && <Badge bg="#EAF6FF" farve="#0D274A" kant="#B8DFF8">Nyt</Badge>}
        {haster && <Badge bg="#FFF1F1" farve="#B03A3A" kant="#F3C9C9">{dage <= 0 ? "Frist i dag" : `${dage} dage tilbage`}</Badge>}
        {o.beholdt_som_sendt && <Badge bg="#F5F6F8" farve={MUTED} kant="#E6EAEF">Du har fået besked om denne</Badge>}
      </div>

      <h2 style={{ fontSize: 18, lineHeight: 1.35, margin: "0 0 6px", color: NAVY }}>{o.title || "Udbud"}</h2>
      <p style={{ margin: "0 0 10px", color: MUTED, fontSize: 14 }}>
        {o.buyer_name || "Ordregiver ikke oplyst"} · Frist {fmtDato(o.deadline)} · {fmtBeloeb(o.amount, o.currency)}
        {o.nationwide ? " · Hele landet" : (o.nuts_codes?.length ? ` · ${o.nuts_codes.join(", ")}` : "")}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={`/udbud/${o.share_token}`} style={{ ...KNAP_PRIMARY, textDecoration: "none", display: "inline-block" }}>
          Se udbuddet
        </Link>
        <button type="button" style={KNAP_SEKUNDAER} onClick={onFjern}>Ikke relevant</button>
      </div>
    </div>
  );
}

function Badge({ children, bg, farve, kant }) {
  return (
    <span style={{ background: bg, color: farve, border: `1px solid ${kant}`, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// "Sortér i opgaver" — 3 spørgsmål → forhåndsvisning → bekræft.

function SorterPanel({ token, kriterier, fag, regioner, kanFortryde, onFortryd, onGemt }) {
  const [beloebTrin, setBeloebTrin] = useState(trinFraKriterier(kriterier || {}));
  const [bredde, setBredde] = useState(kriterier?.bredde === "alle" ? "alle" : "valgte");
  const [nuts, setNuts] = useState(kriterier?.nuts_codes || []);
  const [preview, setPreview] = useState(null);
  const [henter, setHenter] = useState(false);
  const [gemmer, setGemmer] = useState(false);
  const [fejl, setFejl] = useState(null);

  const trin = BELOEB_TRIN.find((t) => t.key === beloebTrin) || BELOEB_TRIN[0];
  const forslag = {
    bredde,
    nuts_codes: nuts,
    min_amount: trin.min,
    max_amount: trin.max,
  };

  function toggleNuts(kode) {
    setPreview(null);
    setNuts((prev) => (prev.includes(kode) ? prev.filter((k) => k !== kode) : [...prev, kode]));
  }

  async function seEffekt() {
    setFejl(null); setHenter(true); setPreview(null);
    try {
      setPreview(await previewCriteria(token, forslag));
    } catch (e) {
      setFejl(e.message || "Kunne ikke beregne forhåndsvisningen.");
    } finally {
      setHenter(false);
    }
  }

  async function gem(bekraeftNul = false) {
    setFejl(null); setGemmer(true);
    try {
      const res = await saveMyCriteria(token, forslag, bekraeftNul);
      if (res?.error === "giver_nul") {
        setFejl("nul");        // håndteres som en bekræftelse nedenfor, ikke som en fejl
        return;
      }
      if (!res?.ok) { setFejl("Kunne ikke gemme. Prøv igen."); return; }
      await onGemt();
    } finally {
      setGemmer(false);
    }
  }

  const fagNavne = fag.map((f) => f.label_da).join(", ");

  return (
    <div style={{ ...CARD, marginTop: 16, borderColor: "#B8DFF8", background: "#FBFDFF" }}>
      <h2 style={{ fontSize: 19, margin: "0 0 4px", color: NAVY }}>Sortér i opgaver</h2>
      {/* Ingen overraskelser: det skal stå LIGE HER at det ændrer fremtiden, ikke bare
          rydder skærmen. Kunden må aldrig opdage det først når beskederne udebliver. */}
      <p style={{ margin: "0 0 18px", color: MUTED, lineHeight: 1.6, fontSize: 14 }}>
        Svar på tre spørgsmål, så <b style={{ color: NAVY }}>opdaterer vi hvilke opgaver du får</b> — både her på
        listen og i de beskeder vi sender dig fremover. Du ser konsekvensen før du gemmer, og du kan altid fortryde.
      </p>

      <Sporgsmaal nr={1} titel="Hvor store opgaver vil du have?">
        <div style={{ display: "grid", gap: 8 }}>
          {BELOEB_TRIN.map((t) => (
            <Valg
              key={t.key}
              type="radio"
              valgt={beloebTrin === t.key}
              onClick={() => { setBeloebTrin(t.key); setPreview(null); }}
              titel={t.label}
              hjaelp={t.hjaelp}
            />
          ))}
        </div>
        <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13, lineHeight: 1.5 }}>
          Mange udbud oplyser ikke noget beløb på forhånd. Dem viser vi altid — ellers ville du gå glip af
          opgaver, alene fordi ordregiveren ikke skrev et tal.
        </p>
      </Sporgsmaal>

      <Sporgsmaal nr={2} titel="Hvor bredt vil du se inden for dit fag?">
        <div style={{ display: "grid", gap: 8 }}>
          <Valg
            type="radio" valgt={bredde === "valgte"}
            onClick={() => { setBredde("valgte"); setPreview(null); }}
            titel="Kun mit kerneområde"
            hjaelp="Præcis de arbejdsområder du valgte ved tilmelding — færre, men mere præcise opgaver"
          />
          <Valg
            type="radio" valgt={bredde === "alle"}
            onClick={() => { setBredde("alle"); setPreview(null); }}
            titel="Alt inden for min branche"
            hjaelp={fagNavne ? `Alle udbud i ${fagNavne} — flere opgaver, også nogle der ligger i udkanten af dit felt` : "Flere opgaver, også nogle i udkanten af dit felt"}
          />
        </div>
      </Sporgsmaal>

      <Sporgsmaal nr={3} titel="Hvor vil du arbejde?">
        <div style={{ display: "grid", gap: 8 }}>
          {(regioner || []).map((r) => {
            const koder = r.nuts_codes || [];
            const valgt = koder.every((k) => nuts.includes(k)) && koder.length > 0;
            return (
              <Valg
                key={r.region_key}
                type="checkbox" valgt={valgt}
                onClick={() => koder.forEach(toggleNuts)}
                titel={REGION_LABEL[r.region_key] || r.region_key}
              />
            );
          })}
        </div>
        <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13, lineHeight: 1.5 }}>
          Udbud der gælder hele landet får du uanset hvad du vælger her.
        </p>
      </Sporgsmaal>

      {/* --- Forhåndsvisning: konsekvensen FØR der gemmes --- */}
      <div style={{ borderTop: "1px solid #E6EAEF", marginTop: 18, paddingTop: 16 }}>
        {!preview && (
          <button type="button" style={KNAP_PRIMARY} onClick={seEffekt} disabled={henter}>
            {henter ? "Regner…" : "Se hvad det betyder"}
          </button>
        )}

        {preview && (
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 17, color: NAVY, lineHeight: 1.5 }}>
              Det giver dig <b>{preview.efter} {preview.efter === 1 ? "opgave" : "opgaver"}</b> i stedet for {preview.nu}.
            </p>
            {preview.uden_beloeb > 0 && (
              <p style={{ margin: "0 0 10px", color: MUTED, fontSize: 13 }}>
                Heraf {preview.uden_beloeb} uden oplyst beløb — dem viser vi altid.
              </p>
            )}

            {preview.efter === 0 && (
              <div style={{ background: "#FFF1F1", border: "1px solid #F3C9C9", borderRadius: 10, padding: "12px 14px", margin: "10px 0" }}>
                <b style={{ color: "#B03A3A" }}>Det her giver dig ingen opgaver.</b>
                <p style={{ margin: "6px 0 0", color: NAVY, fontSize: 14, lineHeight: 1.5 }}>
                  Med de svar hører du ikke fra os, før der kommer et udbud der passer præcis. Er du sikker?
                </p>
              </div>
            )}

            <ListeUdsnit titel="Dette forsvinder fra din liste" farve="#B03A3A" poster={preview.forsvinder} />
            <ListeUdsnit titel="Dette kommer til" farve={TEAL} poster={preview.kommer_til} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <button
                type="button"
                style={KNAP_PRIMARY}
                disabled={gemmer}
                onClick={() => gem(preview.efter === 0 || fejl === "nul")}
              >
                {gemmer ? "Gemmer…" : preview.efter === 0 ? "Ja, gem alligevel" : "Bekræft og gem"}
              </button>
              <button type="button" style={KNAP_SEKUNDAER} onClick={() => setPreview(null)} disabled={gemmer}>
                Justér svarene
              </button>
            </div>
          </div>
        )}

        {fejl && fejl !== "nul" && <p style={{ color: "#B03A3A", marginTop: 12, fontSize: 14 }}>{fejl}</p>}
        {fejl === "nul" && (
          <p style={{ color: "#B03A3A", marginTop: 12, fontSize: 14 }}>
            Forslaget giver nul opgaver. Tryk “Ja, gem alligevel” hvis det er meningen.
          </p>
        )}

        {kanFortryde && (
          <p style={{ marginTop: 18, marginBottom: 0, fontSize: 14 }}>
            <button
              type="button"
              onClick={onFortryd}
              style={{ background: "none", border: "none", padding: 0, color: TEAL, fontWeight: 700, cursor: "pointer", fontSize: 14, textDecoration: "underline" }}
            >
              Fortryd sidste ændring
            </button>
            <span style={{ color: MUTED }}> — sætter dine kriterier tilbage som de var.</span>
          </p>
        )}
      </div>
    </div>
  );
}

function Sporgsmaal({ nr, titel, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, margin: "0 0 10px", color: NAVY }}>
        <span style={{ color: TEAL, fontWeight: 800 }}>{nr}.</span> {titel}
      </h3>
      {children}
    </div>
  );
}

function Valg({ valgt, onClick, titel, hjaelp, type }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", width: "100%",
        background: valgt ? "#EAF6FF" : "#fff",
        border: `1px solid ${valgt ? "#8CCDF0" : "#E6EAEF"}`,
        borderRadius: 10, padding: "11px 13px", cursor: "pointer",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flex: "0 0 18px", height: 18, marginTop: 1,
          borderRadius: type === "radio" ? "50%" : 5,
          border: `2px solid ${valgt ? TEAL : "#C8D0DA"}`,
          background: valgt ? TEAL : "#fff",
          boxShadow: valgt ? "inset 0 0 0 3px #fff" : "none",
        }}
      />
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontWeight: 600, color: NAVY, fontSize: 15 }}>{titel}</span>
        {hjaelp && <span style={{ display: "block", color: MUTED, fontSize: 13, lineHeight: 1.45, marginTop: 2 }}>{hjaelp}</span>}
      </span>
    </button>
  );
}

function ListeUdsnit({ titel, farve, poster }) {
  if (!poster || !poster.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: farve, marginBottom: 6 }}>{titel} ({poster.length})</div>
      <ul style={{ margin: 0, paddingLeft: 18, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
        {poster.slice(0, 8).map((p, i) => (
          <li key={i}>{p.title} <span style={{ color: "#9AA5B1" }}>· frist {fmtDato(p.deadline)}</span></li>
        ))}
        {poster.length > 8 && <li style={{ listStyle: "none", marginLeft: -18 }}>… og {poster.length - 8} mere</li>}
      </ul>
    </div>
  );
}
