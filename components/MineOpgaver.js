"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { fetchMyTasks, previewCriteria, saveMyCriteria, undoMyCriteria, dismissTask, sendDismissReason, markerSomRelevant, afvisNaerMatch, saetSmsBesked } from "../lib/share";

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

// De fire strukturerede fravalgsgrunde (migration 0042). Værdierne mapper 1:1 til
// kundens egne kriterie-dimensioner og til fase 2's træk-filtre — forkert_fag→CPV,
// forkert_omraade→NUTS, forkert_stoerrelse→beløb, ikke_nu→intet træk. Rør ikke
// nøglerne uden at rette taksonomien begge steder; dashboardet tæller på dem.
//
// "For stor" og "For lille" er bevidst ÉN knap her: retningen udleder vi af det beløb
// serveren snapshotter ved fravalget (0044), så kunden ikke skal gætte hvilken kasse
// hendes indvending hører til.
const GRUNDE = [
  ["forkert_fag", "Forkert fag"],
  ["forkert_omraade", "Forkert område"],
  ["forkert_stoerrelse", "Forkert størrelse"],
  ["ikke_nu", "Ikke lige nu"],
];

// Valgfri 1-5. Vurderer DEN FJERNEDE OPGAVE, ikke Birdly som helhed — derfor er den
// pr. match og lander i samme række som grunden.
const SMILEYS = [
  [1, "😠", "Ramte slet ikke"],
  [2, "🙁", "Ramte dårligt"],
  [3, "😐", "Sådan da"],
  [4, "🙂", "Ramte meget godt"],
  [5, "😀", "Ramte perfekt"],
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

export default function MineOpgaver({ token, data, intern = null }) {
  const [opgaver, setOpgaver] = useState(data?.opgaver || []);
  const [kriterier, setKriterier] = useState(data?.kriterier || null);
  const [kanFortryde, setKanFortryde] = useState(!!data?.kan_fortryde);
  const [sortering, setSortering] = useState("relevans");
  const [panelAaben, setPanelAaben] = useState(false);
  const [besked, setBesked] = useState(null);
  // Senest fjernede opgave → grundlaget for den VALGFRIE grund-række. Null = skjult.
  const [senestFjernet, setSenestFjernet] = useState(null);
  // FASE 2: "lagt til side"-bunken. Tom når serveren ikke skjuler noget (leveret-tilstand),
  // og så renderes hele afsnittet slet ikke — siden er da identisk med før fase 2.
  const [lagtTilSide, setLagtTilSide] = useState(data?.lagt_til_side || []);
  const [bunkeAaben, setBunkeAaben] = useState(false);
  // NÆR-MATCH: forslag over kundens beløbsloft. Tom når flaget er slukket.
  const [naerMatch, setNaerMatch] = useState(data?.naer_match || []);

  // Åbn sorterings-panelet direkte når linket bærer #sorter (velkomstmailens knap).
  // Kører efter hydrering, så serveren og klienten renderer ens.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#sorter") {
      setPanelAaben(true);
      setTimeout(() => document.getElementById("sorter")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, []);

  // Afvis et forslag. Fjernelsen sker FØRST og lokalt — kunden skal se at vi lyttede
  // med det samme, ikke vente på serveren. Kaldet må fejle uden at rulle det tilbage;
  // i værste fald dukker forslaget op igen ved næste indlæsning, og det er langt bedre
  // end en knap der ser ud til ikke at virke.
  async function haandterAfvisNaerMatch(shareToken) {
    setNaerMatch((prev) => prev.filter((x) => x.share_token !== shareToken));
    try {
      await afvisNaerMatch(token, shareToken);
    } catch {
      /* med vilje tavs — se noten ovenfor */
    }
  }

  const visteOpgaver = useMemo(() => {
    const kopi = [...opgaver];
    if (sortering === "frist") {
      kopi.sort((a, b) => String(a.deadline || "").localeCompare(String(b.deadline || "")));
    }
    return kopi; // "relevans" = serverens rækkefølge (smalle CPV-træf → egen region → frist)
  }, [opgaver, sortering]);

  const antalNye = opgaver.filter((o) => o.er_ny).length;

  // ---------- Adgang udløbet ----------
  // Serveren har allerede afgjort dette og sender INGEN opgavedata med (se
  // birdly_list_access). Siden kan derfor ikke vise noget den ikke må — den kender
  // kun datoen. Tonen er en oplysning, ikke en straf: kunden har betalt for den
  // periode hun fik, og døren står åben.
  if (data && data.found && data.has_access === false) {
    // Kun to årsager kan lukke en liste (migration 0040): abonnementet er ophørt, eller
    // den forudbetalte periode efter en opsigelse er løbet ud.
    const tekst = {
      opsagt: "Dit abonnement er ophørt, så din opgaveliste er lukket.",
      adgang_udloebet: "Din opsigelse er trådt i kraft, og den betalte periode er udløbet.",
    }[data.reason] || "Din adgang til opgavelisten er udløbet.";

    return (
      <main style={{ ...WRAP, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 28px" }}><Logo /></div>
        <div style={CARD}>
          <h1 style={{ fontSize: 22, margin: "4px 0 12px", color: NAVY }}>Din adgang er udløbet</h1>
          <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 10px" }}>{tekst}</p>
          {data.access_until && (
            <p style={{ color: MUTED, lineHeight: 1.6, margin: "0 0 18px" }}>
              Adgangen gjaldt til og med <b style={{ color: NAVY }}>{fmtDato(data.access_until)}</b>.
            </p>
          )}
          <p style={{ margin: "0 0 20px", color: NAVY, lineHeight: 1.6 }}>
            Forny dit abonnement, så åbner listen igen — med de opgaver der passer til jer lige nu.
          </p>
          <Link href="https://birdly.dk" style={{ ...KNAP_PRIMARY, textDecoration: "none", display: "inline-block" }}>
            Forny abonnement
          </Link>
          <p style={{ marginTop: 20, color: MUTED, fontSize: 13, lineHeight: 1.6 }}>
            Spørgsmål? Skriv til <a href="mailto:support@birdly.dk" style={{ color: TEAL, fontWeight: 600 }}>support@birdly.dk</a>.
          </p>
        </div>
      </main>
    );
  }

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
    const friske = await fetchMyTasks(token, intern);
    if (!friske?.found) return;
    const varNy = new Set(opgaver.filter((o) => o.er_ny).map((o) => o.match_id));
    setOpgaver((friske.opgaver || []).map((o) => ({ ...o, er_ny: o.er_ny || varNy.has(o.match_id) })));
    setKriterier(friske.kriterier || null);
    setKanFortryde(!!friske.kan_fortryde);
    setLagtTilSide(friske.lagt_til_side || []);
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

  // Fjernelsen sker STRAKS og betingelsesløst — nul friktion, ingen pop-up der spærrer.
  // Først BAGEFTER tilbyder vi en valgfri grund. Kunden skal kunne rydde sin liste uden
  // at blive afhørt; grunden er noget hun kan give os, ikke noget vi opkræver.
  async function haandterFjern(matchId, title) {
    const res = await dismissTask(token, matchId, true);
    if (res?.ok) {
      setOpgaver((prev) => prev.filter((o) => o.match_id !== matchId));
      setLagtTilSide((prev) => prev.filter((o) => o.match_id !== matchId));
      setSenestFjernet({ id: matchId, title, trin: "grund" });
    }
  }

  // Trin 1 → trin 2. Grunden gemmes med det samme og rækken bliver STÅENDE, nu med
  // smiley-spørgsmålet: den der lige har svaret på ét spørgsmål svarer også gerne på
  // det næste. Fejler kaldet, taber vi ét datapunkt — kunden mærker intet, og rækken
  // går videre alligevel.
  async function haandterGrund(grund) {
    if (!senestFjernet) return;
    sendDismissReason(token, senestFjernet.id, { grund });
    setSenestFjernet((s) => (s ? { ...s, trin: "smiley" } : null));
  }

  // Trin 2. Sidste led — rækken lukker uanset udfald, så kunden aldrig hænger fast i
  // et spørgeskema hun ikke bad om.
  async function haandterSmiley(rating) {
    if (!senestFjernet) return;
    sendDismissReason(token, senestFjernet.id, { rating });
    setSenestFjernet(null);
  }

  // KORREKTIONS-LOOPET. Kunden har fundet en opgave i bunken som vi ikke skulle have
  // lagt væk. Den flyttes straks op i hovedlisten — hun skal se at vi lyttede med det
  // samme, ikke først ved næste indlæsning. Serveren relakserer de træk der skjulte
  // den, så samme slags opgave ikke bliver lagt væk igen.
  async function haandterRelevant(matchId) {
    const o = lagtTilSide.find((x) => x.match_id === matchId);
    if (!o) return;
    setLagtTilSide((prev) => prev.filter((x) => x.match_id !== matchId));
    const { hvorfor, hvorfor_tekst, ...ren } = o;
    setOpgaver((prev) => [ren, ...prev]);
    setBesked({ type: "ok", tekst: "Tak — vi holder op med at sortere den slags fra." });
    markerSomRelevant(token, matchId); // fejler den, står opgaven stadig i hovedlisten
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

      {senestFjernet && (
        <div style={{ ...CARD, marginTop: 14, padding: "14px 18px", background: "#F7FAFC", borderColor: "#E6EAEF" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {senestFjernet.trin === "grund" ? (
              <>
                <span style={{ color: NAVY, fontSize: 14, fontWeight: 600 }}>Fjernet.</span>
                <span style={{ color: MUTED, fontSize: 14 }}>Må vi spørge hvorfor? (helt frivilligt)</span>
                {GRUNDE.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => haandterGrund(key)}
                    style={{ ...KNAP, padding: "6px 12px", fontSize: 13, background: "#fff", color: NAVY, border: "1px solid #D7DDE5" }}
                  >
                    {label}
                  </button>
                ))}
              </>
            ) : (
              <>
                <span style={{ color: NAVY, fontSize: 14, fontWeight: 600 }}>Tak.</span>
                <span style={{ color: MUTED, fontSize: 14 }}>Hvor godt ramte den her opgave?</span>
                {SMILEYS.map(([vaerdi, tegn, titel]) => (
                  <button
                    key={vaerdi}
                    type="button"
                    onClick={() => haandterSmiley(vaerdi)}
                    title={titel}
                    aria-label={titel}
                    style={{ ...KNAP, padding: "4px 10px", fontSize: 20, lineHeight: 1.2, background: "#fff", color: NAVY, border: "1px solid #D7DDE5" }}
                  >
                    {tegn}
                  </button>
                ))}
              </>
            )}
            <button
              type="button"
              onClick={() => setSenestFjernet(null)}
              style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: 0 }}
            >
              Nej tak
            </button>
          </div>
        </div>
      )}

      {/* Ankeret #sorter: velkomstmailens "Ændre opgavekriterier"-knap peger hertil,
          og useEffect'en nedenfor åbner panelet når det er i URL'en. Uden det ville
          linket lande på listen og efterlade kunden med at lede efter knappen. */}
      <div id="sorter" />
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
            Vi kigger videre hver dag og sender dig besked, så snart der kommer en opgave der passer.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visteOpgaver.map((o) => (
            <OpgaveKort key={o.match_id} o={o} intern={intern} onFjern={() => haandterFjern(o.match_id, o.title)} />
          ))}
        </div>
      )}

      {/* LAGT TIL SIDE (fase 2). Knappen er ALTID synlig når bunken ikke er tom — intet
          er skjult uden at kunden kan se at det findes, og hvor mange der er. */}
      {lagtTilSide.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <button
            type="button"
            onClick={() => setBunkeAaben((v) => !v)}
            style={{ ...KNAP_SEKUNDAER, width: "100%", textAlign: "left", padding: "13px 16px", fontWeight: 600 }}
          >
            {bunkeAaben ? "Skjul" : "Se"} opgaver vi har lagt til side ({lagtTilSide.length})
            <span style={{ display: "block", color: MUTED, fontWeight: 400, fontSize: 13, marginTop: 3 }}>
              Frasorteret ud fra din tidligere adfærd — ingenting er slettet.
            </span>
          </button>

          {bunkeAaben && (
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              {/* Engangs-forklaring. Kunden skal forstå mekanikken FØRSTE gang hun møder
                  den, ikke gætte sig til hvorfor noget ligger i en anden bunke. */}
              <div style={{ ...CARD, background: "#F7FAFC", borderColor: "#E6EAEF" }}>
                <p style={{ margin: 0, color: NAVY, lineHeight: 1.6, fontSize: 14 }}>
                  Når du gentagne gange fravælger den samme slags opgave, lægger vi lignende
                  opgaver herned i stedet for at fylde din hovedliste med dem. De bliver
                  aldrig slettet, og du kan altid åbne dem her. Passer en alligevel, så tryk
                  <b> Dette er relevant</b> — så holder vi op med at sortere den slags fra.
                </p>
              </div>
              {lagtTilSide.map((o) => (
                <OpgaveKort
                  key={o.match_id}
                  o={o}
                  intern={intern}
                  tilSide
                  onRelevant={() => haandterRelevant(o.match_id)}
                  onFjern={() => haandterFjern(o.match_id, o.title)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* NÆR-MATCH: forslag der matcher alt undtagen beløbet. Tom liste ⇒ hele
          afsnittet renderes ikke, præcis som "lagt til side" — så siden er identisk
          med før funktionen fandtes, så længe flaget er slukket.
          Står NEDERST med vilje: det er et sikkerhedsnet, ikke hovedproduktet, og må
          aldrig skubbe kundens rigtige opgaver ned. */}
      {naerMatch.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ ...CARD, background: "#FFFDF5", borderColor: "#F2D98A" }}>
            <h2 style={{ fontSize: 17, margin: "0 0 6px", color: NAVY }}>
              Lidt over dit beløbsloft ({naerMatch.length})
            </h2>
            <p style={{ margin: 0, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
              Der har ikke været opgaver der passer helt til dine kriterier den seneste uge.
              Disse passer på dit fag og dit område, men er større end det beløb du har sat.
              Er de for store, så tryk <b>Ikke interessant</b> — så holder vi op med at foreslå
              den slags.
            </p>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {naerMatch.map((o) => (
              <OpgaveKort
                key={o.share_token}
                o={o}
                naerMatch
                onAfvis={() => haandterAfvisNaerMatch(o.share_token)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ANDEN INDGANG til selvbetjeningen. Knappen findes allerede øverst, men en
          kunde der har scrollet gennem 40 opgaver og tænker "det er for meget" er
          nederst — ikke øverst. Samme panel, ingen ny side. Skjules når panelet er
          åbent, så der ikke står to knapper der gør det samme. */}
      {!panelAaben && (
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <button
            type="button"
            style={{ ...KNAP_PRIMARY, padding: "13px 24px", fontSize: 15.5 }}
            onClick={() => {
              setPanelAaben(true);
              // Rul op til panelet — ellers åbner det uden for skærmen og ser ud som
              // om knappen ikke virkede.
              setTimeout(() => document.getElementById("sorter")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
            }}
          >
            Ændre mine opgavekriterier
          </button>
          <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13, lineHeight: 1.55 }}>
            Får du for mange eller for få opgaver? Justér fag-bredde, område og størrelse —
            eller slå SMS fra.
          </p>
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

// naerMatch: forslag der matcher alt undtagen beløbet. SAMME kort som de rigtige
// opgaver — ikke en ny komponent — så de aldrig kan komme til at se ud som to
// forskellige produkter. Forskellen er ét badge, én knap og hvor "Se opgaven" peger.
function OpgaveKort({ o, onFjern, intern = null, tilSide = false, onRelevant = null, naerMatch = false, onAfvis = null }) {
  const dage = dageTil(o.deadline);
  // Ingen "haster"-badge uden en frist — vi kan ikke vide om den haster, og et gæt
  // ville enten stresse kunden unødigt eller give falsk ro.
  const haster = !o.frist_ukendt && dage != null && dage <= 14;
  return (
    <div style={CARD}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        {/* Forholdet til kundens EGET loft. "1,8× dit loft" kan afvises på et sekund;
            et beløb alene kræver at hun selv regner. */}
        {naerMatch && o.gange_over_loft && (
          <Badge bg="#FFF7E0" farve="#8a6d1f" kant="#F2D98A">{String(o.gange_over_loft).replace(".", ",")}× dit beløbsloft</Badge>
        )}
        {!naerMatch && o.er_ny && <Badge bg="#EAF6FF" farve="#0D274A" kant="#B8DFF8">Nyt</Badge>}
        {haster && <Badge bg="#FFF1F1" farve="#B03A3A" kant="#F3C9C9">{dage <= 0 ? "Frist i dag" : `${dage} dage tilbage`}</Badge>}
        {o.beholdt_som_sendt && <Badge bg="#F5F6F8" farve={MUTED} kant="#E6EAEF">Du har fået besked om denne</Badge>}
      </div>

      <h2 style={{ fontSize: 18, lineHeight: 1.35, margin: "0 0 6px", color: NAVY }}>{o.title || "Opgave"}</h2>
      <p style={{ margin: "0 0 10px", color: MUTED, fontSize: 14 }}>
        {o.buyer_name || "Ordregiver ikke oplyst"} ·{" "}
        {/* Fristløse udbud (0060): sig at datoen skal findes hos udbyder, ikke bare
            "—". Et tomt felt ser ud som et hul i vores data; dette fortæller hvad
            kunden skal gøre. */}
        {o.frist_ukendt ? "Frist ikke oplyst — tjek hos udbyder" : <>Frist {fmtDato(o.deadline)}</>}
        {" · "}{fmtBeloeb(o.amount, o.currency)}
        {o.nationwide ? " · Hele landet" : (o.nuts_codes?.length ? ` · ${o.nuts_codes.join(", ")}` : "")}
      </p>

      {/* HVORFOR den ligger til side. Teksten kommer FÆRDIG fra serveren og beskriver
          det træk der FAKTISK skjulte opgaven — ikke et træk som guldklump-værnet lige
          har reddet den fra. Kunden skal kunne stole på begrundelsen. */}
      {tilSide && (o.hvorfor_tekst || []).length > 0 && (
        <div style={{ background: "#F7FAFC", border: "1px solid #E6EAEF", borderRadius: 10, padding: "10px 12px", margin: "0 0 12px" }}>
          {o.hvorfor_tekst.map((t, i) => (
            <p key={i} style={{ margin: i ? "4px 0 0" : 0, color: MUTED, fontSize: 13, lineHeight: 1.5 }}>{t}</p>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {naerMatch ? (
          // ⚠️ Til den OFFICIELLE kilde, ikke /udbud/{token}: den rute slår op i
          // notice_matches.share_token, og et nær-match-token findes ikke dér —
          // linket ville give 404. Et forslag er heller ikke en leverance, så den
          // fulde opgaveside med bud-skabelon hører ikke til her.
          o.source_url ? (
            <a href={o.source_url} target="_blank" rel="noopener noreferrer" style={{ ...KNAP_PRIMARY, textDecoration: "none", display: "inline-block" }}>
              Se opgaven hos udbyder
            </a>
          ) : null
        ) : (
          /* Markøren følger med ind på opgaven, så et internt klik heller ikke tæller
             en åbning. Uden markør er linket NØJAGTIG som før. */
          <Link href={`/udbud/${o.share_token}${intern ? `?intern=${encodeURIComponent(intern)}` : ""}`} style={{ ...KNAP_PRIMARY, textDecoration: "none", display: "inline-block" }}>
            Se opgaven
          </Link>
        )}
        {naerMatch ? (
          <button type="button" style={KNAP_SEKUNDAER} onClick={onAfvis}>Ikke interessant — for høj værdi</button>
        ) : tilSide ? (
          <button type="button" style={KNAP_SEKUNDAER} onClick={onRelevant}>Dette er relevant</button>
        ) : (
          <button type="button" style={KNAP_SEKUNDAER} onClick={onFjern}>Ikke relevant</button>
        )}
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
  // 'fag' | 'alle' — de eneste to værdier subscribers_bredde_chk tillader.
  const [bredde, setBredde] = useState(kriterier?.bredde === "alle" ? "alle" : "fag");
  const [nuts, setNuts] = useState(kriterier?.nuts_codes || []);
  // SMS-kanalen. Gemmes med det samme ved klik — ikke sammen med kriterierne, fordi
  // den ikke ændrer HVILKE opgaver kunden får, kun hvordan hun høres om dem.
  const [sms, setSms] = useState(kriterier?.notify_sms !== false);
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
            type="radio" valgt={bredde === "fag"}
            onClick={() => { setBredde("fag"); setPreview(null); }}
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

      {/* --- BESKEDKANAL — adskilt fra kriterierne med vilje ---
          De tre spørgsmål ovenfor ændrer HVAD kunden får; dette ændrer HVORDAN hun
          får det. Det hører ikke til i forhåndsvisningen ("du får 18 i stedet for
          117"), fordi det ikke ændrer antallet — derfor gemmes det med det samme,
          uden om Se-hvad-det-betyder-knappen. */}
      <div style={{ borderTop: "1px solid #E6EAEF", marginTop: 18, paddingTop: 16 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, color: NAVY, fontSize: 15.5 }}>Hvordan vil du have besked?</p>
        <label style={{ display: "flex", gap: 11, alignItems: "flex-start", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={sms}
            onChange={async (e) => {
              const ny = e.target.checked;
              setSms(ny); // vis valget straks — kunden skal ikke vente på serveren
              const r = await saetSmsBesked(token, ny);
              if (!r) setSms(!ny); // kun ved fejl rulles det tilbage
            }}
            style={{ marginTop: 3, width: 17, height: 17, accentColor: TEAL, flex: "0 0 17px" }}
          />
          <span>
            <b style={{ color: NAVY, fontSize: 15 }}>Send mig også en SMS</b>
            <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.55, marginTop: 2 }}>
              {/* Sig hvad der sker når man slår fra — ellers gætter kunden, og nogle
                  vil tro de slukker for alt og lade være. */}
              Slår du fra, får du kun besked på mail. Mailen kan ikke slås fra — det er
              sådan vi holder dig opdateret.
            </div>
          </span>
        </label>
      </div>

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
