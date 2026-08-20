"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BirdMark } from "./Logo";
import { fetchCatalog } from "../lib/catalog";
import { opretOpgave, redigerOpgave } from "../lib/privatOpgave";
import { FORMIDLER_TEKST } from "../lib/formidlerTekst";
import { OMFANG } from "../lib/omfang";
import { slaaPostnrOp } from "../lib/postnumre";
import { OPRET_OPGAVE_ANMELDELSER } from "../lib/opretOpgave";
import "../app/start.css";
import "../app/opret-opgave.css";

// ============================================================================
// /opret-opgave — den offentlige side hvor private og virksomheder lægger en opgave op.
//
// ⚠️ ORDET "RELEVANT" BRUGES ALDRIG I KUNDEVENDT TEKST. Det er husreglen, og der er
// en ekstra grund her: "relevante virksomheder" antyder at vi har vurderet og udvalgt
// dem. Det gør vi ikke — vi matcher på fag og område. Betingelsernes §7 siger
// udtrykkeligt at vi ikke indestår for den enkelte virksomhed, og hero-teksten må ikke
// love noget de fralægger sig tre klik senere.
//
// ⚠️ AL ØVRIG COPY ER ORDRET FRA DEN GODKENDTE MOCKUP. Overskrifter, FAQ-svar og
// facilitator-teksten er juridisk gennemtænkte formuleringer ("Birdly er på ingen måde
// part eller mellemmand"). Skriv dem ikke om for at gøre dem kortere.
//
// ⚠️ FAG-LISTEN HENTES FRA KATALOGET (fetchCatalog → katalog.fag), ikke hardkodet.
// Mockuppen havde en håndskrevet liste på 18 navne; den ville drive fra databasen i
// samme øjeblik et fag blev tilføjet eller omdøbt, og så ville en opgave blive oprettet
// under et fag der ikke findes. Det er samme liste funnelen bruger.
//
// ⚠️ INGEN CPV-KODER I UI'ET. Kunden ser fagnavne. Oversættelsen fag → CPV sker
// server-side når opgaven skal matches — aldrig her.
//
// ⚠️ DENNE SIDE RØRER IKKE match, notify, ingest ELLER betaling. Den skriver til sit
// eget, isolerede lag. Se noten ved `send()`.
// ============================================================================

const HVORNAAR = [
  "Snarest muligt",
  "Inden for 1 måned",
  "Inden for 3 måneder",
  "Jeg er fleksibel",
];

// Nøglen "andet" findes ikke i fag-kataloget — den er sidens egen, og den åbner et
// fritekstfelt. Holdes adskilt fra katalogets nøgler så den aldrig kan forveksles
// med et rigtigt fag når opgaven skal matches.
const ANDET = "__andet__";

const FAQ = [
  {
    sp: "Koster det noget at oprette en opgave?",
    sv: "Nej. Det er helt gratis for dig at oprette en opgave på Birdly. Vi tager ikke betaling for at folk lægger opgaver op på vores side.",
  },
  {
    sp: "Er Birdly part i aftalen med virksomheden?",
    sv: "Nej. Birdly er på ingen måde part eller mellemmand på opgaven — vi faciliterer kun kontakten mellem udbyder og opgavetager. Vi blander os ikke i det økonomiske eller på anden måde i indgåelsen af aftalen mellem parterne. Birdly er ren og skær en marketplace, der forbinder dem, der vil have udført en opgave, med dem, der påtager sig den.",
  },
  {
    sp: "Hvem kontakter mig?",
    sv: "De virksomheder i vores netværk, hvis fag og område passer til din opgave. De tager selv fat i dig via telefon eller mail, så I kan aftale det videre direkte.",
  },
  {
    sp: "Skal jeg oprette en konto?",
    sv: "Nej. Du skal blot udfylde formularen. Ingen konto, ingen adgangskode, ingen app.",
  },
  {
    sp: "Hvad gør I med mine oplysninger?",
    sv: "Vi bruger dine oplysninger til at sende din opgave videre til de virksomheder, der arbejder med din opgave, så de kan kontakte dig. Vi deler dem ikke til andre formål. Læs mere i vores privatlivspolitik.",
  },
  {
    sp: "Er jeg forpligtet til at vælge en af virksomhederne?",
    sv: "Nej. Du bestemmer helt selv, om du vil gå videre med en af de virksomheder, der kontakter dig. Du forpligter dig ikke til noget ved at oprette en opgave.",
  },
];

// ⚠️ OPDIGTEDE. Må ALDRIG vises uden at OPRET_OPGAVE_ANMELDELSER er tændt, og flaget
// må først tændes når der findes ægte anmeldelser at sætte i stedet. Fabrikeret social
// proof er ulovligt (markedsføringsloven) og i strid med Metas annoncepolitik.
const ANMELDELSER = [
  { init: "MK", navn: "Martin K.", by: "Holbæk", tekst: "Jeg oprettede en opgave om et nyt tag lørdag aften — mandag havde jeg to lokale tømrere i røret. Super nemt." },
  { init: "PN", navn: "Pernille N.", by: "Roskilde", tekst: "Slap for selv at ringe rundt. Beskrev bare opgaven, og så kom virksomhederne til mig. Fandt en dygtig elektriker." },
  { init: "JS", navn: "Jens S.", by: "Køge", tekst: "Enkelt og gratis. Ingen konto, ingen bøvl. Fik tre bud på malerarbejde inden for et døgn." },
];

function Flueben({ farve = "var(--teal)", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={farve} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 4.5L6.5 12 2.5 8" />
    </svg>
  );
}

// ⚠️ ÉN FORMULAR, TO TILSTANDE. `rediger` er { list_token, opgave } og slår
// komponenten om til redigering: samme felter, samme validering, samme fejlbeskeder.
// En separat redigerings-formular ville uundgåeligt drive fra denne — et felt tilføjet
// det ene sted og glemt det andet — og så ville opretteren kunne rette i noget hun
// ikke kunne oprette, eller omvendt.
//
// I redigerings-tilstand skjules hero, anmeldelser, "sådan virker det" og FAQ: hun
// kender siden, hun skal rette en stavefejl.
export default function OpretOpgave({ rediger = null }) {
  const erRedigering = !!rediger;
  const forud = rediger?.opgave || null;
  const [fagListe, setFagListe] = useState([]);
  const [regioner, setRegioner] = useState([]);
  const [udbyder, setUdbyder] = useState(forud?.udbyder_type || "privat");
  const [cvr, setCvr] = useState(forud?.cvr || "");
  const [beskrivelse, setBeskrivelse] = useState(forud?.beskrivelse || "");
  const [valgteFag, setValgteFag] = useState(
    forud ? [...(forud.fag_keys || []), ...(forud.fag_andet ? [ANDET] : [])] : []
  );
  const [andetTekst, setAndetTekst] = useState(forud?.fag_andet || "");
  const [postnr, setPostnr] = useState(forud?.postnr || "");
  const [regionKey, setRegionKey] = useState(forud?.region_key || "");
  const [hvornaar, setHvornaar] = useState(forud?.hvornaar || HVORNAAR[0]);
  // ⚠️ VALGFRIT — tom streng = sprunget over. Se noten ved feltet.
  const [omfang, setOmfang] = useState(forud?.omfang || "");
  const [filer, setFiler] = useState([]);
  const [navn, setNavn] = useState(forud?.kontakt_navn || "");
  const [telefon, setTelefon] = useState(forud?.kontakt_telefon || "");
  const [email, setEmail] = useState(forud?.kontakt_email || "");
  // ⚠️ SAMTYKKET KRÆVES IKKE IGEN VED REDIGERING. Hun gav det da opgaven blev
  // oprettet, og det er stadig i kraft. At bede om det igen ville antyde at det var
  // udløbet — og et kryds hun sætter rutinemæssigt er et dårligere samtykke end det
  // hun gav bevidst første gang.
  const [samtykke, setSamtykke] = useState(erRedigering);
  const [sender, setSender] = useState(false);
  const [fejl, setFejl] = useState("");
  const [sendt, setSendt] = useState(false);
  // Honeypot: skjult for mennesker. Er det udfyldt, er afsenderen en bot.
  const [hp, setHp] = useState("");
  const [listeUrl, setListeUrl] = useState("");

  // Samme kilde som funnelen. Fejler opslaget, står listen tom frem for at falde
  // tilbage på en hardkodet kopi der kan være forældet.
  useEffect(() => {
    fetchCatalog()
      .then((k) => {
        setFagListe(k?.fag || []);
        // ⚠️ "hele_dk" filtreres fra — præcis som funnelen gør (Start.js). Der er
        // bare en anden grund til det her: i funnelen er regionen kundens DÆKNING,
        // hvor "hele Danmark" giver mening. Her er den opgavens PLACERING, og en
        // tagopgave ligger ét sted. Slap hele_dk igennem, ville den blive oversat
        // til DK0 og ramme hver eneste kunde i landet.
        setRegioner((k?.regions || []).filter((r) => r.key !== "hele_dk"));
      })
      .catch(() => { setFagListe([]); setRegioner([]); });
  }, []);

  // ⚠️ UDLEDT, IKKE GEMT I STATE. Slår man bynavnet op i en useEffect og lægger det i
  // sin egen state, kan de to nå at være uenige et kort øjeblik — og brugeren ser en
  // by der ikke passer til det hun lige har tastet. Her kan de ikke komme ud af trit.
  const postnrTraef = slaaPostnrOp(postnr);

  // ⚠️ LANDSDELEN AUTO-VÆLGES, MEN LÅSES IKKE. 23 postnumre strækker sig over to
  // regioner (fx 2640 Hedehusene, 7100 Vejle); for dem er forvalget afgjort af
  // postnummerets geografiske centrum, og en adresse kan ligge på den anden side af
  // grænsen. Derfor sætter vi kun landsdelen når brugeren ikke selv har rørt feltet —
  // et manuelt valg må aldrig blive overskrevet af et opslag.
  const [regionRoert, setRegionRoert] = useState(erRedigering);
  useEffect(() => {
    if (regionRoert) return;
    if (postnrTraef?.region_key) setRegionKey(postnrTraef.region_key);
  }, [postnrTraef?.region_key, regionRoert]);

  const harAndet = valgteFag.includes(ANDET);

  function skiftFag(key) {
    setValgteFag((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));
  }

  function send(e) {
    e.preventDefault();
    setFejl("");

    // Validering i den rækkefølge felterne står, så fejlen peger på det første
    // problem brugeren møder på vej ned ad siden — ikke det sidste.
    if (udbyder === "b2b" && !/^\d{8}$/.test(cvr.replace(/\s/g, ""))) {
      return setFejl("Skriv et CVR-nummer på 8 cifre.");
    }
    if (!beskrivelse.trim()) return setFejl("Beskriv kort hvad der skal laves.");
    if (!valgteFag.length) return setFejl("Vælg mindst én opgaveart.");
    if (harAndet && !andetTekst.trim()) return setFejl("Beskriv opgavearten, når du har valgt “Andet”.");
    if (!/^\d{4}$/.test(postnr.trim())) return setFejl("Skriv et dansk postnummer på 4 cifre.");
    if (!regionKey) return setFejl("Vælg hvilken landsdel opgaven ligger i.");
    if (!navn.trim()) return setFejl("Skriv dit navn.");
    if (!telefon.trim() && !email.trim()) return setFejl("Skriv enten telefon eller e-mail, så virksomhederne kan få fat i dig.");
    if (!samtykke) return setFejl("Sæt kryds i feltet, så vi må dele din opgave med virksomhederne.");

    setSender(true);
    (async () => {
      try {
        const felter = {
          udbyder_type: udbyder,
          cvr: udbyder === "b2b" ? cvr.replace(/\s/g, "") : null,
          beskrivelse,
          fag_keys: valgteFag.filter((k) => k !== ANDET),
          fag_andet: harAndet ? andetTekst : null,
          region_key: regionKey,
          postnr: postnr.trim(),
          hvornaar,
          omfang: omfang || null,
          kontakt_navn: navn.trim(),
          kontakt_telefon: telefon.trim(),
          kontakt_email: email.trim(),
          samtykke: true,
          hp,
        };
        const r = erRedigering
          ? await redigerOpgave(rediger.list_token, rediger.opgave.id, felter)
          : await opretOpgave(felter);
        // ⚠️ LINKET VISES OG SENDES. Opretteren har ingen konto — mister hun linket,
        // kan hun ikke se sin opgave. Derfor står det på kvitteringen OG går med i
        // mail/SMS, frem for kun ét af stederne.
        if (erRedigering) {
          // Tilbage til listen — hun rettede en stavefejl, ikke oprettede noget nyt,
          // og en "tak for din opgave"-kvittering ville være forvirrende.
          window.location.href = `/opgave/${rediger.list_token}?rettet=1`;
          return;
        }
        if (r.list_token) setListeUrl(`/opgave/${r.list_token}`);
        setSendt(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        // Serverens koder oversættes her — brugeren skal se hvad hun kan gøre ved det,
        // ikke en teknisk nøgle.
        const tekster = {
          manglende_samtykke: "Sæt kryds i feltet, så vi må dele din opgave.",
          manglende_fag: "Vælg mindst én opgaveart.",
          manglende_kontakt: "Skriv enten telefon eller e-mail.",
          ukendt_fag: "En af opgavearterne kunne ikke genkendes. Prøv at vælge dem igen.",
          kan_ikke_redigeres: "Opgaven er lukket og kan ikke rettes længere.",
          link_udloebet: "Dit link er udløbet. Opret en ny opgave, så får du et nyt.",
        };
        setFejl(tekster[e.kode] || "Vi kunne ikke gemme din opgave lige nu. Prøv igen om lidt.");
      } finally {
        setSender(false);
      }
    })();
  }

  return (
    <div className="oo">
      {/* ---------- MINIMAL TOPBAR ---------- */}
      <header className="oo-top">
        <div className="oo-top-inner">
          {/* ⚠️ BirdMark + ordmærke i tekst, IKKE <Logo>. Det fulde logo i /public er
              tegnet til lyse baggrunde og forsvinder næsten helt på navy — det stod
              der ved første gennemsyn. Footeren løser samme problem på samme måde;
              se noten i Logo.js. */}
          <Link href="/" className="oo-mark" aria-label="Birdly forside">
            <BirdMark size={28} />
            <span>Birdly<span className="oo-dk">.dk</span></span>
          </Link>
          <Link href="/" className="oo-tilbage">
            <span aria-hidden="true">←</span> Tilbage til forsiden
          </Link>
        </div>
      </header>

      {/* ---------- HERO ----------
          Skjult ved redigering: hun kender siden og skal rette en stavefejl, ikke
          overbevises om at bruge tjenesten. */}
      {!erRedigering && (
      <div className="oo-hero">
        <div className="oo-eyebrow">Opret opgave — gratis</div>
        <h1>Skal du have lavet noget?</h1>
        <p>
          Beskriv din opgave på 60 sekunder. Så sender vi den videre til lokale
          virksomheder, der arbejder med din opgave.
        </p>
        <div className="oo-trust">
          <span><Flueben /> Helt gratis at oprette</span>
          <span><Flueben /> Ingen konto nødvendig</span>
          <span><Flueben /> Lokale virksomheder</span>
        </div>
      </div>
      )}

      <main>
        <div className="oo-wrap">
          {/* ---------- FORMULAR ---------- */}
          <div className={erRedigering ? "" : "oo-form"}>
            <div className="st-kort">
              {sendt ? (
                <div className="oo-kvit">
                  <div className="oo-flueben"><Flueben size={26} /></div>
                  <h2>Tak — vi har din opgave</h2>
                  <p>
                    Vi finder de virksomheder i vores netværk, hvis fag og område passer til
                    opgaven, og vender tilbage til dig. Du hører fra os på {email.trim() ? email.trim() : telefon.trim()}.
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Du forpligter dig ikke til noget — og du bestemmer selv, om du vil gå
                    videre med en af dem, der kontakter dig.
                  </p>
                  {listeUrl && (
                    <>
                      {/* ⚠️ LINKET SKAL STÅ HER, ikke kun i mailen. Opretteren har ingen
                          konto; mister hun linket, kan hun ikke se sin egen opgave. */}
                      <a href={listeUrl} className="oo-send" style={{ display: "block", textDecoration: "none", textAlign: "center", marginTop: 20 }}>
                        Se din opgave
                      </a>
                      <p style={{ fontSize: 13.5, color: "var(--navy-soft)", marginTop: 12, lineHeight: 1.6 }}>
                        Din opgave er aktiv i 3 dage. Du kan til enhver tid lukke den eller
                        forlænge den — vi sender dig også linket, så du har det.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={send} noValidate>
                  <h1>{erRedigering ? "Ret din opgave" : "Opret din opgave"}</h1>
                  <p className="st-hj">
                    {erRedigering
                      ? "Ret det du vil — virksomheder der allerede har taget opgaven, beholder den."
                      : "Udfyld felterne herunder — det tager under et minut."}
                  </p>

                  {/* 1. Udbyder */}
                  <label className="st-lab" style={{ marginTop: 26 }}>Udbyder af opgaven er</label>
                  <div className="st-omr">
                    <label className={"st-omrk" + (udbyder === "privat" ? " on" : "")}>
                      <input type="radio" name="udbyder" checked={udbyder === "privat"} onChange={() => setUdbyder("privat")} />
                      <span><b>Privatperson</b><i>Jeg opretter opgaven privat</i></span>
                    </label>
                    <label className={"st-omrk" + (udbyder === "b2b" ? " on" : "")}>
                      <input type="radio" name="udbyder" checked={udbyder === "b2b"} onChange={() => setUdbyder("b2b")} />
                      <span><b>Virksomhed (B2B)</b><i>Jeg opretter på vegne af en virksomhed</i></span>
                    </label>
                  </div>

                  {/* CVR — folder sig ud ved B2B */}
                  {udbyder === "b2b" && (
                    <>
                      <label className="st-lab" htmlFor="oo-cvr">CVR-nummer</label>
                      <input id="oo-cvr" className="st-felt" type="text" inputMode="numeric" placeholder="fx 12345678"
                        value={cvr} onChange={(e) => setCvr(e.target.value)} />
                    </>
                  )}

                  {/* 2. Hvad */}
                  <label className="st-lab" htmlFor="oo-besk">
                    Hvad skal der laves? <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— beskriv kort din opgave</span>
                  </label>
                  <textarea id="oo-besk" className="st-felt" rows={5}
                    placeholder="Fx: Jeg skal have udskiftet ca. 120 m² tag på en villa. Ønskes udført inden 3 måneder."
                    value={beskrivelse} onChange={(e) => setBeskrivelse(e.target.value)} />

                  {/* 3. Opgaveart */}
                  <label className="st-lab">
                    Opgaveart <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— vælg en eller flere</span>
                  </label>
                  <div className="oo-chips">
                    {fagListe.map((f) => (
                      <button type="button" key={f.key}
                        className={"oo-chip" + (valgteFag.includes(f.key) ? " on" : "")}
                        aria-pressed={valgteFag.includes(f.key)}
                        onClick={() => skiftFag(f.key)}>
                        {f.label_da || f.label || f.key}
                      </button>
                    ))}
                    <button type="button"
                      className={"oo-chip" + (harAndet ? " on" : "")}
                      aria-pressed={harAndet}
                      onClick={() => skiftFag(ANDET)}>
                      Andet
                    </button>
                  </div>
                  {harAndet && (
                    <input className="st-felt" style={{ marginTop: 10 }} type="text"
                      placeholder="Beskriv opgavearten selv…"
                      value={andetTekst} onChange={(e) => setAndetTekst(e.target.value)} />
                  )}

                  {/* 4. Hvor / hvornår */}
                  {/* ⚠️ POSTNUMMER OG LANDSDEL ER IKKE DET SAMME FELT, og dubletten er
                      med vilje. Der findes ingen postnummer→geografi-tabel i systemet
                      (migration 0008 udskød den, og det blev aldrig gjort), og
                      virksomhederne er registreret på landsdel. Et gæt ud fra
                      postnummer-intervaller ville være omtrentligt og vist som sikkert
                      — samme fælde som den ikke-verificerede branchekode-seed.
                      Postnummeret er til mennesket der ringer dig op; landsdelen er
                      det matchet regner på.

                      ⚠️ SIDEN 20-08-2026 udfyldes landsdelen automatisk fra et opslag i
                      Danmarks officielle adresseregister (lib/postnumre.js). Feltet
                      bliver stående synligt og redigerbart — 23 postnumre krydser en
                      regionsgrænse, og der er forvalget et kvalificeret gæt. */}
                  <div className="oo-to" style={{ marginTop: 20 }}>
                    <div>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-post">Hvor skal det laves?</label>
                      <input id="oo-post" className="st-felt" type="text" inputMode="numeric" maxLength={4}
                        placeholder="Postnummer, fx 4300"
                        value={postnr} onChange={(e) => setPostnr(e.target.value.replace(/\D/g, ""))} />
                      {/* Kvitteringen er hele pointen med opslaget: brugeren kan SE at vi
                          forstod hvor opgaven ligger, frem for at skulle stole på det. */}
                      {postnr.length === 4 && (
                        postnrTraef ? (
                          <div className="oo-postnr-ok">✓ {postnr} {postnrTraef.by}</div>
                        ) : (
                          <div className="oo-postnr-nej">Vi kender ikke det postnummer — vælg landsdel selv.</div>
                        )
                      )}
                    </div>
                    <div>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-region">
                        Landsdel
                        {postnrTraef && !regionRoert && (
                          <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}> — udfyldt automatisk</span>
                        )}
                      </label>
                      <select id="oo-region" className="st-felt" value={regionKey}
                        onChange={(e) => { setRegionRoert(true); setRegionKey(e.target.value); }}>
                        <option value="">Vælg landsdel …</option>
                        {regioner.map((r) => <option key={r.key} value={r.key}>{r.name || r.key}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-hvornaar">Hvornår?</label>
                    <select id="oo-hvornaar" className="st-felt" value={hvornaar} onChange={(e) => setHvornaar(e.target.value)}>
                      {HVORNAAR.map((h) => <option key={h}>{h}</option>)}
                    </select>
                  </div>

                  {/* ⚠️ VALGFRIT, OG DET ER EN BESLUTNING. Et påkrævet budgetfelt er den
                      slags friktion der får folk til at lukke fanen: en privatperson VED
                      sjældent hvad et nyt tag koster, og tvinger man hende til at gætte,
                      får virksomheden et tal der er værre end ingenting.
                      "Det ved jeg ikke" er derfor et rigtigt valg, ikke bare fravær —
                      så kan virksomheden se forskel på "hun sprang over" og "hun sagde
                      det". */}
                  <label className="st-lab">
                    Hvad anslår du opgavens omfang til?{" "}
                    <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— valgfrit</span>
                  </label>
                  <div className="st-omr">
                    {OMFANG.map((o) => (
                      <label key={o.key} className={"st-omrk" + (omfang === o.key ? " on" : "")}>
                        <input type="radio" name="omfang" checked={omfang === o.key}
                          onChange={() => setOmfang(o.key)} />
                        <span>
                          <b>{o.label}</b>
                          {o.interval && <i>{o.interval}</i>}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* 5. Billeder */}
                  <label className="st-lab" htmlFor="oo-fil">
                    Billeder <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— valgfrit</span>
                  </label>
                  <label className="oo-fil" htmlFor="oo-fil">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 16V4m0 0L8 8m4-4l4 4M3 18h18" />
                    </svg>
                    <div>Træk billeder hertil, eller <b>vælg fra din enhed</b></div>
                  </label>
                  <input id="oo-fil" type="file" multiple accept="image/*" style={{ display: "none" }}
                    onChange={(e) => setFiler([...(e.target.files || [])])} />
                  {filer.length > 0 && (
                    <div className="oo-filnavne">
                      {filer.length} {filer.length === 1 ? "billede" : "billeder"} valgt: {filer.map((f) => f.name).join(", ")}
                    </div>
                  )}

                  {/* 6. Kontakt */}
                  <div className="oo-to" style={{ marginTop: 20 }}>
                    <div>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-navn">Dit navn</label>
                      <input id="oo-navn" className="st-felt" type="text" placeholder="Fornavn Efternavn"
                        value={navn} onChange={(e) => setNavn(e.target.value)} />
                    </div>
                    <div>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-tlf">Telefon</label>
                      <input id="oo-tlf" className="st-felt" type="tel" placeholder="+45 12 34 56 78"
                        value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                    </div>
                  </div>
                  <label className="st-lab" htmlFor="oo-mail">E-mail</label>
                  <input id="oo-mail" className="st-felt" type="email" placeholder="dig@eksempel.dk"
                    value={email} onChange={(e) => setEmail(e.target.value)} />

                  {/* ⚠️ HONEYPOT. Skjult for mennesker (ikke display:none — nogle bots
                      læser det); et menneske kan hverken se eller tabbe til det.
                      Udfyldt = bot, og serveren gemmer intet. Åben formular + betalt
                      trafik tiltrækker junk, og junk-leads der rammer betalende
                      virksomheder koster tillid. */}
                  <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                    <label htmlFor="oo-firmanavn2">Firmanavn</label>
                    <input id="oo-firmanavn2" type="text" tabIndex={-1} autoComplete="off"
                      value={hp} onChange={(e) => setHp(e.target.value)} />
                  </div>

                  {/* ⚠️ SAMTYKKET ER PÅKRÆVET og blokerer afsendelsen. Serveren afviser
                      også en oprettelse uden det (manglende_samtykke), så et manipuleret
                      klientkald ikke kan springe det over. To lag, fordi samtykket er
                      hjemlen til overhovedet at dele nummeret videre.

                      ⚠️ ORDLYDEN ER JURIDISK TEKST og afventer Jonas + advokat. Skriv den
                      ikke om for at gøre den kortere. Den tidligere formulering sagde
                      "relevante virksomheder" — det ord bruger vi ikke i kundevendt
                      tekst, og det antyder desuden en udvælgelse vi ikke foretager. */}
                  <label className="st-tjek">
                    <input type="checkbox" checked={samtykke} onChange={(e) => setSamtykke(e.target.checked)} />
                    <span>
                      Jeg accepterer{" "}
                      <Link href="/betingelser-private-opgaver" target="_blank" rel="noopener noreferrer">
                        Betingelser for oprettelse af private opgaver
                      </Link>{" "}
                      og at Birdly deler mine kontaktoplysninger med de virksomheder, der
                      tager min opgave.
                    </span>
                  </label>

                  {/* Ansvarsfraskrivelsen står BÅDE her og på opretterens opgaveliste,
                      med samme ordlyd. Ser hun den kun ét sted, kan hun nå at glemme den
                      inden virksomhederne ringer. */}
                  <p className="oo-disclaimer">{FORMIDLER_TEKST}</p>

                  {fejl && <div className="st-fejl" style={{ marginTop: 16 }}>{fejl}</div>}

                  <button type="submit" className="oo-send" disabled={sender}>
                    {sender ? "Gemmer …" : erRedigering ? "Gem ændringer" : "Find virksomheder →"}
                  </button>
                  <div className="oo-efter">Det er gratis, og du forpligter dig ikke til noget.</div>
                </form>
              )}
            </div>
          </div>

          {/* ---------- ANMELDELSER ----------
              Slukket som default. Se lib/opretOpgave.js. */}
          {!erRedigering && OPRET_OPGAVE_ANMELDELSER && (
            <section className="oo-blok">
              <div className="oo-hoved">
                <div className="oo-eyebrow">Anmeldelser</div>
                <h2>Det siger andre om Birdly</h2>
                <p>Rigtige mennesker, der har fået hjælp til deres opgave.</p>
              </div>
              <div className="oo-anm">
                {ANMELDELSER.map((a) => (
                  <div className="oo-anm-kort" key={a.navn}>
                    <div className="oo-stjerner">★★★★★</div>
                    <p>&ldquo;{a.tekst}&rdquo;</p>
                    <div className="oo-hvem">
                      <div className="oo-av">{a.init}</div>
                      <div><b>{a.navn}</b><small>{a.by}</small></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="oo-anm-note">
                Eksempel-anmeldelser til mockup — erstattes med ægte anmeldelser fra kunder.
              </div>
            </section>
          )}

          {/* ---------- SÅDAN VIRKER DET ---------- */}
          {!erRedigering && (
          <section className="oo-blok">
            <div className="oo-hoved">
              <div className="oo-eyebrow">Sådan virker det</div>
              <h2>Fra opgave til håndværker på 3 trin</h2>
            </div>
            <div className="oo-trin">
              <div className="oo-trin-kort">
                <div className="oo-nr">1</div>
                <h3>Beskriv din opgave</h3>
                <p>Fortæl kort hvad du skal have lavet, hvor og hvornår. Det tager under et minut — ingen konto nødvendig.</p>
              </div>
              <div className="oo-trin-kort">
                <div className="oo-nr">2</div>
                <h3>Birdly finder de rette</h3>
                <p>Vi sender din opgave til de lokale virksomheder, der arbejder med netop den type opgave i dit område.</p>
              </div>
              <div className="oo-trin-kort">
                <div className="oo-nr">3</div>
                <h3>De kontakter dig</h3>
                <p>Virksomhederne, der kan hjælpe, tager direkte fat i dig. Så aftaler I resten indbyrdes.</p>
              </div>
            </div>

            <div className="oo-facil">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EB7FF" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="M12 8v.5M12 11v5" />
              </svg>
              <div>
                <h3>Birdly er ikke part i din opgave</h3>
                <p>
                  Vi faciliterer udelukkende kontakten mellem dig og virksomhederne. Vi tager
                  ikke betaling for at oprette opgaver, og vi blander os ikke i pris, aftale
                  eller udførelse — det aftaler I selv, direkte.
                </p>
              </div>
            </div>
          </section>

          )}

          {/* ---------- FAQ ---------- */}
          {!erRedigering && (
          <section className="oo-blok">
            <div className="oo-hoved">
              <div className="oo-eyebrow">Spørgsmål &amp; svar</div>
              <h2>Ofte stillede spørgsmål</h2>
            </div>
            <div className="oo-faq">
              {FAQ.map((q, i) => (
                <details key={q.sp} open={i === 0}>
                  <summary>{q.sp} <span className="oo-pm">+</span></summary>
                  <div className="oo-svar">{q.sv}</div>
                </details>
              ))}
            </div>
          </section>
          )}

          {erRedigering && (
            <p style={{ marginTop: 18, textAlign: "center" }}>
              <a href={`/opgave/${rediger.list_token}`} style={{ color: "var(--navy-soft)", fontSize: 14 }}>
                ← Tilbage uden at gemme
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
