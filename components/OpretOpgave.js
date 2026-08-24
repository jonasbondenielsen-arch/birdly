"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BirdMark } from "./Logo";
import { fetchCatalog } from "../lib/catalog";
import { opretOpgave, redigerOpgave, uploadOpgaveBillede } from "../lib/privatOpgave";
import { OMFANG } from "../lib/omfang";
import { slaaPostnrOp } from "../lib/postnumre";
import { OPRET_OPGAVE_ANMELDELSER } from "../lib/opretOpgave";
import FagVaelger from "./FagVaelger";
import { spor, sporEnGang } from "../lib/pixel";
import { fangAttribution, hentAttribution } from "../lib/attribution";
import "../app/start.css";
import "../app/opret-opgave.css";

// ============================================================================
// /opret-opgave — den offentlige side hvor private og virksomheder lægger en opgave op.
//
// ⚠️ ORDET "RELEVANT" BRUGES ALDRIG I KUNDEVENDT TEKST. Det er husreglen, og der er
// en ekstra grund her: "relevante virksomheder" antyder at vi har vurderet og udvalgt
// dem. Det gør vi ikke — vi matcher på fag og område. Betingelsernes §8 siger
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
  // ⚠️ "Hurtigst muligt" frem for "Snarest muligt" (Jonas 24-08). Vaerdien gemmes som
  // fritekst paa opgaven og vises til virksomheden, saa aendringen slaar igennem
  // begge steder. Sikkert i dag: der er nul opgaver i basen.
  "Hurtigst muligt",
  "Inden for 1 måned",
  "Inden for 3 måneder",
  "Jeg er fleksibel",
];

// Nøglen "andet" findes ikke i fag-kataloget — den er sidens egen, og den åbner et
// fritekstfelt. Holdes adskilt fra katalogets nøgler så den aldrig kan forveksles
// med et rigtigt fag når opgaven skal matches.
const ANDET = "__andet__";

// ⚠️ SKAL STEMME MED opgave-billeder (Edge Function) OG bucket-loftet i 0085. De tre
// steder håndhæver hver sit lag: browseren for at give besked med det samme,
// function'en fordi klienten kan omgås, bucket'en fordi function'en kan rettes ved et
// uheld. Ændrer du tallet her, så ændr det alle tre steder.
// ⚠️ KUNDE-VENDTE LABELS, OG DE AFVIGER BEVIDST FRA lib/omfang.js.
//
// Kunden ser IKKE kr.-intervallerne (Jonas 24-08). Med beloeb pa skaermen bliver
// spoergsmaalet reelt "hvad er dit budget?", og en privatperson der ikke ved hvad et
// tag koster, gaetter et tal hun ikke kan staa inde for - eller lukker fanen.
// Virksomheden ser stadig baandet MED interval; det er en anden beslutning, og
// lib/omfang.js er derfor uroert.
//
// ⚠️ NOEGLEN ER DET ENESTE DER GEMMES. Teksterne her er ren visning; `key` er det der
// staar i basen og i event-loggen. Aendrer du en key, aendrer du data - aendrer du en
// tekst her, aendrer du kun hvad hun laeser.
const OMFANG_KUNDE = {
  mindre: "Mindre opgave",
  mellem: "Mellemstor opgave",
  stor: "Større opgave",
  ved_ikke: "Ved ikke",
};

const MAKS_BILLEDER = 5;
const MAKS_BILLED_BYTES = 10 * 1024 * 1024;

// ⚠️ RÆKKEFØLGEN ER EFTER HVAD EN PRIVAT BRUGER FAKTISK SPØRGER OM, ikke efter hvad
// der er nemmest at svare på. Pris først, derefter "hvem får mine oplysninger" — det
// er den indvending der stopper folk, og den skal ikke ligge nummer fem.
//
// ⚠️ "Er Birdly part i aftalen?" er FJERNET som FAQ. Den mørke boks over FAQ'en siger
// præcis det samme, og to svar på samme spørgsmål læser som om vi forsvarer os.
//
// ⚠️ ANTYD ALDRIG EN GODKENDELSE VI IKKE FORETAGER. Vi finder virksomheder ud fra fag
// og område og indestår ikke for den enkelte — det står i betingelsernes §8, og
// intet svar her må love mere end det.
const FAQ = [
  {
    sp: "Koster det noget at oprette en opgave?",
    sv: "Nej. Det er 100 % gratis for dig at oprette en opgave på Birdly. Du betaler hverken Birdly for at oprette opgaven eller for at blive matchet med virksomheder.",
  },
  {
    sp: "Hvor mange virksomheder får mine oplysninger?",
    // ⚠️ SVARET SKAL SPEJLE SAMTYKKET, ikke marketing-linjen. "Maks. 3" handler om
    // hvem der KONTAKTER hende; beskrivelse og billeder ses af alle matchede, så de
    // kan vurdere opgaven. Skriver vi "kun 3 ser din opgave", modsiger FAQ'en det
    // hun lige har sat kryds i.
    sv: "Din opgavebeskrivelse og eventuelle billeder deles med de virksomheder, der arbejder med din type opgave i dit område, så de kan vurdere den. Dine kontaktoplysninger deles først, når en virksomhed aktivt tager opgaven — og maks. 3 virksomheder får mulighed for at kontakte dig. Derefter lukkes opgaven for flere.",
  },
  {
    sp: "Er jeg forpligtet til at vælge en virksomhed?",
    sv: "Nej. Du bestemmer helt selv, om du vil gå videre med en af de virksomheder, der kontakter dig. Du forpligter dig ikke til noget ved at oprette en opgave.",
  },
  {
    sp: "Hvordan bliver jeg kontaktet?",
    sv: "Virksomhederne kontakter dig direkte på telefon eller mail. Det er dem, der tager fat i dig — du skal ikke ringe rundt selv.",
  },
  {
    sp: "Skal jeg oprette en konto?",
    sv: "Nej. Du skal blot udfylde formularen. Ingen konto, ingen adgangskode, ingen app. Du får et personligt link på SMS, som du bruger til at følge din opgave.",
  },
  {
    sp: "Hvordan retter eller lukker jeg min opgave?",
    sv: "Gennem dit personlige link. Der kan du rette teksten, tilføje billeder og lukke opgaven, når du har fundet den hjælp, du søgte.",
  },
  {
    sp: "Hvad gør I med mine oplysninger?",
    sv: "Vi bruger dine oplysninger til at sende din opgave videre til de virksomheder, der arbejder med den, så de kan kontakte dig. Vi deler dem ikke til andre formål, og oplysningerne på en lukket opgave slettes eller anonymiseres senest 30 dage efter. Læs mere i vores privatlivspolitik.",
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
  // Hvor mange billeder der faktisk kom frem. Vises på kvitteringen, fordi hun ellers
  // ikke kan vide om de nåede med — og det var netop dét feltet før lod som om.
  const [billedStatus, setBilledStatus] = useState(null);

  // ⚠️ MÅLINGEN MÅ ALDRIG KUNNE VÆLTE FORMULAREN. spor() gater selv på
  // marketing-samtykket og på at fbq findes, men den kaldes fra hændelser midt i
  // hendes indtastning — så alt er pakket ind. En fejlet måling er et hul i en graf;
  // en fejlet formular er en tabt kunde.
  const sporTrin = (navn, data) => { try { spor(navn, data); } catch { /* måling må aldrig vælte */ } };
  // Hvert trin må kun tælle én gang pr. udfyldning, ellers måler vi tastetryk.
  const trinSendt = useRef(new Set());
  const trin = (navn, data) => {
    if (trinSendt.current.has(navn)) return;
    trinSendt.current.add(navn);
    sporTrin(navn, data);
  };

  // Samme kilde som funnelen. Fejler opslaget, står listen tom frem for at falde
  // tilbage på en hardkodet kopi der kan være forældet.
  // ⚠️ LandingPageView fyres KUN her, ikke i layoutet: den skal tælle besøg på DENNE
  // funnel, ikke på birdly.dk generelt. Og attributionen fanges samtidig, saa
  // ?utm_campaign er gemt inden hun navigerer videre i formularen.
  useEffect(() => {
    if (erRedigering) return;
    try { fangAttribution(); } catch { /* attribution maa aldrig vaelte siden */ }
    sporTrin("B2C_LandingPageView");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ⚠️ REGIONEN UDLEDES, KUNDEN VÆLGER DEN IKKE (Jonas 24-08-2026). Opslaget vinder
  // altid når det giver et træf — der er ikke længere et manuelt valg at beskytte.
  useEffect(() => {
    if (postnrTraef?.region_key) setRegionKey(postnrTraef.region_key);
  }, [postnrTraef?.region_key]);

  // Vælgeren foldes kun frem når vi IKKE kan udlede regionen. Uden dette ville et
  // ukendt postnummer være en blindgyde: valideringen kræver en region, og der ville
  // ikke være noget felt at vælge den i.
  const maaVaelgeLandsdel = postnr.length === 4 && !postnrTraef;

  // Navnet på den udledte region — vises i kvitteringen, så udledningen er synlig og
  // ikke sker i det skjulte.
  const regionNavn = postnrTraef?.region_key
    ? (regioner.find((r) => r.key === postnrTraef.region_key)?.label_da || null)
    : null;

  const harAndet = valgteFag.includes(ANDET);

  function skiftFag(key) {
    setValgteFag((f) => {
      const ny = f.includes(key) ? f.filter((x) => x !== key) : [...f, key];
      if (ny.length) { trin("B2C_FormStart"); trin("B2C_TradeSelected"); }
      return ny;
    });
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
    // Rammer i praksis kun ukendte postnumre, hvor vælgeren ER foldet frem.
    if (!regionKey) return setFejl("Vi kunne ikke genkende postnummeret — vælg landsdel herunder.");
    if (!navn.trim()) return setFejl("Skriv dit navn.");
    // ⚠️ TELEFON ER NU PAAKRAEVET (Jonas 24-08), e-mail valgfri. Virksomhederne
    // ringer - en opgave uden nummer bliver liggende. Serveren accepterer stadig
    // telefon ELLER mail, saa klienten er den strengeste af de to; det er den rigtige
    // retning, for en loesere server kan ikke skabe en opgave ingen kan handle paa.
    if (!telefon.trim()) return setFejl("Skriv dit telefonnummer, så virksomhederne kan ringe til dig.");
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
          // ⚠️ ATTRIBUTIONEN GEMMES PÅ OPGAVEN, så Jonas kan se hvilke Meta-annoncer
          // der skaber RIGTIGE opgaver og ikke bare klik. Genbruger funnelens
          // eksisterende lag (lib/attribution.js): første berøring vinder, og det
          // ligger i sessionStorage, så et besøg tre uger senere ikke krediteres den
          // gamle annonce. Serveren hvidlister felterne — se noten i edge functionen.
          attribution: (() => { try { return hentAttribution(); } catch { return {}; } })(),
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

        // ⚠️ BILLEDERNE SENDES HER — EFTER opgaven findes, og ALDRIG som betingelse
        // for den. Opgaven er allerede gemt på dette punkt: fejler en upload, mister
        // hun et billede, ikke sin opgave. Den omvendte rækkefølge ville lade et
        // dårligt mobilsignal koste hende hele oprettelsen.
        //
        // Én ad gangen frem for parallelt: fem samtidige uploads fra en telefon på
        // mobildata er den sikreste måde at få dem alle til at fejle på.
        if (filer.length && r.list_token && r.opgave_id) {
          let ok = 0;
          for (const fil of filer) {
            try {
              await uploadOpgaveBillede(r.list_token, r.opgave_id, fil);
              ok++;
            } catch (uf) {
              console.error("[opret-opgave] billede ikke uploadet:", fil.name, uf?.kode || uf?.message);
            }
          }
          // ⚠️ SIGES HØJT PÅ KVITTERINGEN. Gik et billede tabt, skal hun vide det —
          // ellers tror hun håndværkeren kan se noget han ikke kan, og det var præcis
          // den løgn feltet fortalte før.
          setBilledStatus({ ok, i_alt: filer.length });
        }

        // ⚠️ HER, OG KUN HER. Eventet fyres når opgaven FAKTISK er oprettet — ikke
        // ved klik på knappen. Et CTA-klik der fejler validering ville ellers tælle
        // som en konvertering, og Meta ville optimere mod folk der klikker uden at
        // gennemføre.
        //
        // ⚠️ NAVNET ER `OpgaveOprettet` OG MÅ IKKE DØBES OM. Det er det kanoniske
        // submit-event; omdøbes det, mister en eventuel konfigureret konvertering i
        // Ads Manager sin historik og sin optimering. B2C_JobSubmitted ligger ved
        // siden af som funnel-event, ikke i stedet for.
        //
        // sporEnGang på opgave-id: to faneblade eller et dobbeltklik må ikke tælle to
        // konverteringer.
        try {
          sporEnGang(`opgave_${r.opgave_id}`, "OpgaveOprettet", { content_category: "privat_opgave" });
          sporTrin("B2C_JobSubmitted", { content_category: "privat_opgave" });
        } catch { /* måling må aldrig vælte kvitteringen */ }

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
          {/* ⚠️ "Tilbage til forsiden" ER FJERNET. Det var en exit midt i en
              betalt funnel: en Meta-bruger der klikker den, lander på B2B-forsiden
              med abonnementspriser og er væk. Logoet linker stadig hjem, så vejen
              ud findes — den er bare ikke længere en invitation. */}
        </div>
      </header>

      {/* ---------- HERO ----------
          Skjult ved redigering: hun kender siden og skal rette en stavefejl, ikke
          overbevises om at bruge tjenesten. */}
      {!erRedigering && (
      <div className="oo-hero">
        <div className="oo-eyebrow">OPRET OPGAVE · 100 % GRATIS</div>
        <h1>Skal du have lavet noget?</h1>
        {/* ⚠️ RESULTAT, IKKE PROCES. "Så sender vi den videre" beskriver hvad VI
            gør; "Birdly matcher dig med op til 3 virksomheder" beskriver hvad hun
            får. Tallet 3 er ikke pynt — det er loftet i systemet (PLADSER), og det
            besvarer "hvor mange ringer til mig?" før hun når at spørge. */}
        {/* ⚠️ IKKE "relevante virksomheder". Det antyder en screening vi ikke
            laver. "der arbejder med din opgave" siger det samme uden at love det. */}
        <p>
          Beskriv din opgave på 1 minut. Birdly finder op til 3 virksomheder i dit
          område, der arbejder med din opgave — helt gratis.
        </p>
        <div className="oo-trust">
          <span><Flueben /> 100 % gratis</span>
          <span><Flueben /> Ingen konto</span>
          <span><Flueben /> Maks. 3 virksomheder</span>
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
                  {billedStatus && (
                    billedStatus.ok === billedStatus.i_alt ? (
                      <p style={{ fontSize: 14 }}>
                        {billedStatus.ok === 1 ? "Dit billede" : `Dine ${billedStatus.ok} billeder`} følger med opgaven.
                      </p>
                    ) : (
                      <p style={{ fontSize: 14, color: "#C2410C" }}>
                        {billedStatus.ok} af {billedStatus.i_alt} billeder blev sendt med. Du kan
                        tilføje resten fra din opgaveside.
                      </p>
                    )
                  )}
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
                  <h1>{erRedigering ? "Ret din opgave" : "Find virksomheder til din opgave"}</h1>
                  <p className="st-hj">
                    {erRedigering
                      ? "Ret det du vil — virksomheder der allerede har taget opgaven, beholder den."
                      : "Fortæl kort, hvad du skal have lavet – det tager ca. 1 minut."}
                  </p>

                  {/* 1. Udbyder */}
                  {/* ⚠️ "Udbyder" er udbuds-/B2B-sprog. Siden her er B2C — en
                      privatperson der skal have malet sin stue kalder ikke sig selv
                      udbyder. Kun label'en ændres; feltet og værdierne er de samme. */}
                  <label className="st-lab" style={{ marginTop: 26 }}>Hvem opretter opgaven?</label>
                  <div className="st-omr">
                    <label className={"st-omrk" + (udbyder === "privat" ? " on" : "")}>
                      <input type="radio" name="udbyder" checked={udbyder === "privat"} onChange={() => setUdbyder("privat")} />
                      <span><b>Privatperson</b><i>Jeg opretter opgaven privat</i></span>
                    </label>
                    <label className={"st-omrk" + (udbyder === "b2b" ? " on" : "")}>
                      <input type="radio" name="udbyder" checked={udbyder === "b2b"} onChange={() => setUdbyder("b2b")} />
                      <span><b>Virksomhed</b><i>Jeg opretter på vegne af en virksomhed</i></span>
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
                  <label className="st-lab" htmlFor="oo-besk">Hvad skal du have lavet?</label>
                  {/* ⚠️ "Du behøver ikke kende de tekniske detaljer" står der fordi
                      den hyppigste grund til at en privatperson forlader sådan en
                      formular er en fornemmelse af at hun ikke ved nok til at svare
                      rigtigt. Virksomheden spørger selv ind bagefter. */}
                  <p className="st-hj" style={{ margin: "0 0 8px" }}>
                    Beskriv kort opgaven. Du behøver ikke kende de tekniske detaljer.
                  </p>
                  <textarea id="oo-besk" className="st-felt" rows={5}
                    placeholder="Fx: Vi skal have skiftet ca. 120 m² tag på vores villa. Det gamle tag skal fjernes, og vi vil gerne have arbejdet udført inden for 3 måneder."
                    value={beskrivelse}
                    onChange={(e) => { setBeskrivelse(e.target.value); trin("B2C_FormStart"); }}
                    onBlur={() => { if (beskrivelse.trim().length >= 15) trin("B2C_DescriptionCompleted"); }} />

                  {/* 3. Opgaveart */}
                  {/* 3. Opgaveart */}
                  {/* ⚠️ 22 CHIPS ER VÆK. De fyldte over en halv mobilskærm og skubbede
                      resten af formularen ned under folden — på en side hvor hele
                      pointen er at hun når til bunden. Søgefeltet viser højst 6
                      forslag ad gangen.

                      ⚠️ SØGNINGEN OPRETTER ALDRIG ET FAG. Den finder kun frem til
                      kataloget nøgler; det er dem der gemmes. Se lib/fagSoeg.js. */}
                  <label className="st-lab" htmlFor="oo-fag">Hvilken hjælp har du brug for?</label>
                  <p className="st-hj" style={{ margin: "0 0 8px" }}>
                    Du kan vælge flere, hvis opgaven kræver forskellige fag.
                  </p>
                  <FagVaelger
                    fagListe={fagListe}
                    valgte={valgteFag.filter((k) => k !== ANDET)}
                    onSkift={skiftFag}
                    andetValgt={harAndet}
                    onAndet={() => skiftFag(ANDET)}
                  />
                  {harAndet && (
                    <input className="st-felt" style={{ marginTop: 10 }} type="text"
                      placeholder="Beskriv opgavearten selv…"
                      value={andetTekst} onChange={(e) => setAndetTekst(e.target.value)} />
                  )}

                  {/* 4. Hvor / hvornår */}
                  {/* ⚠️ LANDSDELEN ER IKKE ET FELT LÆNGERE (Jonas 24-08-2026). Den er
                      det matchet regner på, men kunden skal ikke vælge den: hun ved
                      hvor hendes hus ligger, ikke hvilken NUTS-region det hører til.
                      Postnummeret er nok, og regionen udledes af opslaget i Danmarks
                      adresseregister (lib/postnumre.js). Værdien sendes UÆNDRET til
                      serveren — det er kun valget der er væk, ikke data.

                      ⚠️ PRISEN ER KENDT: 23 postnumre strækker sig over to regioner (fx
                      2640 Hedehusene, 7100 Vejle). Før kunne kunden rette forvalget;
                      nu står opslagets gæt fast for dem. Til gengæld er det gæt
                      kvalificeret — postnummerets geografiske centrum — og fejlen
                      rammer kun hvilke virksomheder der ser opgaven, aldrig kundens
                      egne oplysninger.

                      ⚠️ FALLBACKEN ER IKKE VALGFRI. Kender vi ikke postnummeret, er
                      der ingen region at udlede, og valideringen ville blokere hende
                      med en fejl om et felt der ikke findes — en blindgyde uden vej ud.
                      Derfor foldes vælgeren frem PRÆCIS dér, og kun dér. */}
                  <div style={{ marginTop: 20 }}>
                    <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-post">Hvor skal opgaven udføres?</label>
                    <input id="oo-post" className="st-felt" type="text" inputMode="numeric" maxLength={4}
                      placeholder="Postnummer, fx 4300"
                      value={postnr} onChange={(e) => setPostnr(e.target.value.replace(/\D/g, ""))} />
                    {/* Kvitteringen er hele pointen med opslaget: hun kan SE at vi forstod
                        hvor opgaven ligger — nu inkl. regionen, siden hun ikke selv vælger
                        den længere. Uden den ville udledningen ske i det skjulte. */}
                    {postnr.length === 4 && (
                      postnrTraef ? (
                        <div className="oo-postnr-ok">
                          ✓ {postnr} {postnrTraef.by}
                          {regionNavn && <> · {regionNavn}</>}
                        </div>
                      ) : (
                        <div className="oo-postnr-nej">Vi kender ikke det postnummer — vælg landsdel herunder.</div>
                      )
                    )}
                  </div>

                  {/* Kun når postnummeret ikke gav et træf. Se noten ovenfor. */}
                  {maaVaelgeLandsdel && (
                    <div style={{ marginTop: 16 }}>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-region">Landsdel</label>
                      <select id="oo-region" className="st-felt" value={regionKey}
                        onChange={(e) => setRegionKey(e.target.value)}>
                        <option value="">Vælg landsdel …</option>
                        {/* ⚠️ `label_da`, IKKE `name`. Kataloget har aldrig haft et
                            `name`-felt, så fallbacken slog til og dropdownen viste de rå
                            nøgler: "sjaelland" uden æ, alt i småt. */}
                        {regioner.map((r) => <option key={r.key} value={r.key}>{r.label_da || r.name || r.key}</option>)}
                      </select>
                    </div>
                  )}

                  <div style={{ marginTop: 20 }}>
                    <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-hvornaar">Hvornår skal opgaven helst laves?</label>
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
                    Hvor stor er opgaven cirka?{" "}
                    <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— valgfrit</span>
                  </label>
                  <div className="st-omr">
                    {OMFANG.map((o) => (
                      <label key={o.key} className={"st-omrk" + (omfang === o.key ? " on" : "")}>
                        <input type="radio" name="omfang" checked={omfang === o.key}
                          onChange={() => setOmfang(o.key)} />
                        {/* ⚠️ Ingen kr.-interval her. Se noten ved OMFANG_KUNDE. */}
                        <span><b>{OMFANG_KUNDE[o.key] || o.label}</b></span>
                      </label>
                    ))}
                  </div>

                  {/* 5. Billeder */}
                  <label className="st-lab" htmlFor="oo-fil">
                    Har du billeder? <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— valgfrit</span>
                  </label>
                  <p className="st-hj" style={{ margin: "0 0 8px" }}>
                    Tilføj gerne billeder – så kan virksomhederne hurtigere vurdere din opgave.
                  </p>
                  <label className="oo-fil" htmlFor="oo-fil">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 16V4m0 0L8 8m4-4l4 4M3 18h18" />
                    </svg>
                    <div>
                      <b>Tag et billede eller vælg fra din telefon</b>
                      <div style={{ fontSize: 12.5, color: "var(--navy-soft)", marginTop: 4 }}>
                        Op til {MAKS_BILLEDER} billeder, maks 10 MB hver.
                      </div>
                      {/* ⚠️ UX-TEKST, IKKE JURIDISK — men den står her frem for i
                          betingelserne, fordi det er HER hun vælger filerne. En advarsel
                          hun først møder efter uploaden er ubrugelig. */}
                      <div style={{ fontSize: 12.5, color: "var(--navy-soft)", marginTop: 4 }}>
                        Upload kun billeder, der viser selve opgaven. Undgå ansigter, dokumenter og andet, du ikke vil dele.
                      </div>
                    </div>
                  </label>
                  <input id="oo-fil" type="file" multiple accept="image/*" style={{ display: "none" }}
                    onChange={(e) => {
                      // ⚠️ LOFTET STÅR OGSÅ SERVER-SIDE (opgave-billeder). Her er det for
                      // at hun får besked med det samme frem for at opdage det bagefter.
                      const valgte = [...(e.target.files || [])];
                      if (valgte.length > MAKS_BILLEDER) {
                        setFejl(`Du kan vedhæfte op til ${MAKS_BILLEDER} billeder — de første ${MAKS_BILLEDER} er valgt.`);
                      }
                      const forStore = valgte.filter((f) => f.size > MAKS_BILLED_BYTES).map((f) => f.name);
                      if (forStore.length) {
                        setFejl(`Disse billeder er over 10 MB og kan ikke sendes med: ${forStore.join(", ")}`);
                      }
                      setFiler(valgte.filter((f) => f.size <= MAKS_BILLED_BYTES).slice(0, MAKS_BILLEDER));
                    }} />
                  {filer.length > 0 && (
                    <div className="oo-filnavne">
                      {filer.length} {filer.length === 1 ? "billede" : "billeder"} valgt: {filer.map((f) => f.name).join(", ")}
                    </div>
                  )}

                  {/* 6. Kontakt */}
                  {/* ⚠️ SVARET FOER SPOERGSMAALET. "Hvem faar mit nummer?" er den
                      indvending der stopper folk lige inden de taster det - saa den
                      besvares HER, over felterne, ikke i en FAQ laengere nede.
                      Teksten spejler samtykket praecist: op til 3, og kun dem der
                      tager opgaven. */}
                  <label className="st-lab" style={{ marginTop: 26 }}>Hvor kan virksomhederne kontakte dig?</label>
                  <p className="st-hj" style={{ margin: "0 0 12px" }}>
                    Dine oplysninger deles kun med op til 3 virksomheder, som ønsker at tage kontakt om din opgave.
                  </p>
                  <div className="oo-to" style={{ marginTop: 0 }}>
                    <div>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-navn">Dit navn</label>
                      <input id="oo-navn" className="st-felt" type="text" placeholder="Fornavn Efternavn"
                        value={navn}
                        onFocus={() => trin("B2C_ContactStepReached")}
                        onChange={(e) => setNavn(e.target.value)} />
                    </div>
                    <div>
                      <label className="st-lab" style={{ marginTop: 0 }} htmlFor="oo-tlf">Telefon</label>
                      <input id="oo-tlf" className="st-felt" type="tel" placeholder="+45 12 34 56 78"
                        value={telefon}
                        onFocus={() => trin("B2C_ContactStepReached")}
                        onChange={(e) => setTelefon(e.target.value)} />
                    </div>
                  </div>
                  <label className="st-lab" htmlFor="oo-mail">
                    E-mail <span style={{ fontWeight: 400, color: "var(--navy-soft)" }}>— valgfri</span>
                  </label>
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

                      ⚠️ ORDLYDEN ER JURIDISK TEKST, skrevet af Jonas 23-08-2026 og indsat
                      ORDRET. Skriv den ikke om — heller ikke for at gøre den kortere.
                      Advokat kigger den efter; indtil da er den som den er.

                      ⚠️ DEN BESKRIVER TO FORSKELLIGE DELINGER, og forskellen er hele
                      pointen: beskrivelse + billeder går til ALLE matchede virksomheder,
                      så de kan vurdere opgaven — kontaktoplysningerne først til de op til
                      3 der aktivt byder. Slås de to sammen i en kortere sætning, lover
                      teksten noget andet end systemet gør. */}
                  <label className="st-tjek">
                    <input type="checkbox" checked={samtykke} onChange={(e) => setSamtykke(e.target.checked)} />
                    <span>
                      Jeg accepterer, at Birdly deler min opgavebeskrivelse og eventuelle
                      billeder med de virksomheder, der matcher min opgave — og at mine
                      kontaktoplysninger først deles med de op til 3 virksomheder, der
                      vælger at byde på opgaven. Se{" "}
                      <Link href="/betingelser-private-opgaver" target="_blank" rel="noopener noreferrer">
                        betingelser for private opgaver
                      </Link>.
                    </span>
                  </label>

                  {/* ⚠️ ANSVARSFRASKRIVELSEN ER FLYTTET UD AF FLOWET (Jonas 24-08).
                      Den stod som en tekstvæg lige over knappen, præcis dér hvor
                      tvivlen er dyrest. Substansen er der stadig, tre steder hun
                      kommer forbi: den mørke boks "Birdly er ikke part i opgaven"
                      længere nede, betingelserne som samtykket linker til (§7), og
                      hendes egen opgaveliste efter oprettelsen — hvor den står ORDRET
                      som teksten i lib/formidlerTekst.js. Fjern ikke ét af de tre
                      steder uden at tænke over de to andre. */}

                  {fejl && <div className="st-fejl" style={{ marginTop: 16 }}>{fejl}</div>}

                  <button type="submit" className="oo-send" disabled={sender}>
                    {sender ? "Gemmer …" : erRedigering ? "Gem ændringer" : "Find op til 3 virksomheder – GRATIS →"}
                  </button>
                  <div className="oo-efter">✓ 100 % gratis · ✓ Uforpligtende · ✓ Ingen konto</div>
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
              {/* ⚠️ "virksomhed", ikke "håndværker". Kataloget rummer 21 fag —
                  revisor, IT, catering, vagt. En privatperson der søger en advokat
                  skal ikke læse at vi finder håndværkere til hende. */}
              <h2>Fra opgave til virksomhed på 3 trin</h2>
              <p>Gratis for dig – hele vejen.</p>
            </div>
            <div className="oo-trin">
              <div className="oo-trin-kort">
                <div className="oo-nr">1</div>
                <h3>Beskriv din opgave</h3>
                <p>Fortæl kort, hvad du skal have lavet. Det tager ca. 1 minut.</p>
              </div>
              <div className="oo-trin-kort">
                <div className="oo-nr">2</div>
                {/* ⚠️ "de rette" er væk. Det antyder en udvælgelse eller godkendelse
                    vi ikke foretager — vi matcher på fag og område, punktum.
                    Betingelsernes §8 fralægger sig udtrykkeligt indeståelse for den
                    enkelte virksomhed, og forsiden må ikke love det modsatte. */}
                {/* ⚠️ Promptens "Birdly finder de rette" er bevidst IKKE brugt.
                    "De rette" antyder at vi har vurderet og udvalgt dem; vi matcher
                    på fag og område, og betingelsernes §8 fralægger sig udtrykkeligt
                    indeståelse for den enkelte virksomhed. */}
                <h3>Birdly matcher din opgave</h3>
                <p>Vi matcher din opgave med op til 3 virksomheder i dit område, der arbejder med din type opgave.</p>
              </div>
              <div className="oo-trin-kort">
                <div className="oo-nr">3</div>
                <h3>De kontakter dig</h3>
                <p>Virksomhederne kan kontakte dig direkte. Du vælger selv, hvem du vil gå videre med.</p>
              </div>
            </div>

            <div className="oo-facil">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EB7FF" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="M12 8v.5M12 11v5" />
              </svg>
              <div>
                <h3>Birdly er ikke part i opgaven</h3>
                <p>
                  Vi matcher dig med virksomheder, der arbejder med din type opgave. Du vælger
                  selv, hvem du vil gå videre med. Pris, tilbud og selve arbejdet aftaler du
                  direkte med virksomheden — Birdly er ikke part i aftalen og tager ikke
                  betaling fra dig.
                </p>
              </div>
            </div>
          </section>

          )}

          {/* ---------- DIT SMS-OPGAVELINK ----------
              ⚠️ DET ER HER BIRDLY ADSKILLER SIG, og det er værd at sige højt: hun får
              styr på sin opgave uden at oprette noget som helst. Ingen konto, intet
              password — kun et personligt link i en SMS.

              ⚠️ FØRSTE PUNKT SIGER "der har taget din opgave", IKKE "der har fået
              den". Opretteren ser KUN de virksomheder der aktivt har accepteret —
              ikke alle matchede. Skrev vi det bredere, ville hun åbne sit link og
              undre sig over at listen er kortere end lovet. */}
          {!erRedigering && (
          <section className="oo-blok">
            <div className="oo-hoved">
              <div className="oo-eyebrow">Dit opgavelink</div>
              <h2>Du har styr på opgaven fra din mobil</h2>
              <p>Når din opgave er oprettet, sender Birdly dig et personligt link på SMS.</p>
            </div>
            <div className="st-kort" style={{ maxWidth: 560, margin: "0 auto" }}>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Se hvilke virksomheder der har taget din opgave",
                  "Ret din opgave eller tilføj billeder",
                  "Luk opgaven, når du har fundet hjælp",
                ].map((t) => (
                  <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.5 }}>
                    <span style={{ flex: "none", marginTop: 3 }}><Flueben /></span>{t}
                  </li>
                ))}
              </ul>
              <p className="st-hj" style={{ margin: "16px 0 0" }}>
                Ingen konto. Intet password. Bare dit personlige link.
              </p>
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
