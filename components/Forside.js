"use client";

import { useEffect, useRef, useState } from "react";
import { FAQ } from "../lib/faq";
import Link from "next/link";
import Footer from "./Footer";
import OpsigPopup from "./OpsigPopup";
import { Logo } from "./Logo";
import { insertRow } from "../lib/supabase";
import { PLAN, YEARLY_SAVING, priceText } from "../lib/pakke";
import LaunchBanner from "./LaunchBanner";
import LaunchStreamer from "./LaunchStreamer";
import OpgaveTaeller from "./OpgaveTaeller";
import SalgHeader from "./salg/SalgHeader";
import FagBevis from "./salg/FagBevis";
import StickyCtaMobil from "./salg/StickyCtaMobil";
import { FagProvider } from "./salg/FagKontekst";
import { Vaerdi } from "./salg/VaerdiSektion";
import {
  Hero, BevisBjaelke, RisikoFjernet, Problemet, ProblemPris, Loesningen,
  Motoren, SmsDemo, FagVaelgerKort, Kundebevis, IkkePortal, Priser,
  SlutCta, EfterspoergselsLink,
} from "./salg/Sektioner";
import "../app/forside.css";
// ⚠️ EFTER forside.css. De to filer deler ingen klassenavne, men rækkefølgen er
// alligevel den mest læsbare: basen først, salgs-laget ovenpå. De vælgere der
// FAKTISK kunne kollidere (section-padding, details/summary) er hævet til to
// klasser i salg.css, så resultatet ikke afhænger af den her linjes placering.
import "../app/salg.css";

// Slider-chips → links til hver branchesides (/fag/[slug]). Udseende/animation uændret.
const brands = [
  { label: "Tømrer/snedker", slug: "toemrer" },
  { label: "Murer", slug: "murer" },
  { label: "Maler", slug: "maler" },
  { label: "VVS", slug: "vvs" },
  { label: "Elektriker", slug: "elektriker" },
  { label: "Entreprenør/anlæg", slug: "entreprenor" },
  { label: "Kloak/jord", slug: "kloak" },
  { label: "Glarmester", slug: "glarmester" },
  { label: "Rengøring", slug: "rengoring" },
  { label: "Affald/miljø", slug: "affald" },
  { label: "Anlægsgartner", slug: "anlaegsgartner" },
  { label: "Transport", slug: "transport" },
  { label: "Arkitekt", slug: "arkitekt" },
  { label: "Ingeniør/rådgiver", slug: "ingenior" },
  { label: "IT & software", slug: "it" },
  { label: "Service & vedligehold", slug: "service" },
  { label: "Revisor/advokat/forretningsservice", slug: "forretningsservice" },
  { label: "Mad & catering", slug: "catering" },
  { label: "Møbler & inventar", slug: "inventar" },
  { label: "Vagt & sikring", slug: "vagt" },
];

const quickQs = [
  "Hvordan virker det?",
  "Hvad koster det?",
  "Hvilke pakker har I?",
  "Hvordan opsiger jeg?",
];

/* =====================================================================
   botReply(): MIDLERTIDIG svar-logik (nøgleord).
   >>> Etape 2/Hermes: udskift denne funktion med et kald til AI-backend.
   Fx: fetch('/api/support', {method:'POST', body: JSON.stringify({message:text})})
       → returnér svaret som tekst/HTML. Behold visningen i addMsg(...,'bot').
   ===================================================================== */
// Åbningstid: man–fre 08–18 DANSK tid. Beregnes altid i Europe/Copenhagen —
// aldrig i den besøgendes lokale tid, ellers får en kunde i en anden tidszone
// (eller med et skævt ur) forkert offline-tilstand. Fail-open: kan tidszonen
// ikke slås op, regner vi det som åbent — en forkert "vi er offline" midt i
// arbejdstiden er værre end en manglende note udenfor.
const OPENING_WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const OPENING_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Copenhagen",
  weekday: "short",
  hour: "2-digit",
  hourCycle: "h23",
});

function withinOpeningHours(date = new Date()) {
  let weekday = null;
  let hour = NaN;
  try {
    for (const p of OPENING_FMT.formatToParts(date)) {
      if (p.type === "weekday") weekday = WEEKDAY_INDEX[p.value];
      else if (p.type === "hour") hour = Number(p.value);
    }
  } catch {
    return true;
  }
  if (weekday === null || Number.isNaN(hour)) return true;
  return OPENING_WEEKDAYS.includes(weekday) && hour >= 8 && hour < 18;
}

// Udenfor åbningstid svarer botten stadig — den tilføjer bare denne note, så
// kunden ved hvornår et menneske kan følge op.
const OFFLINE_NOTE =
  "— Lige nu er fuglen fløjet 🕊️ Vi er online alle hverdage kl. 08:00–18:00 og er tilbage på pinden næste hverdag. Skriv endelig dit spørgsmål eller send en mail til <b>support@birdly.dk</b> — så vender vi tilbage.";

function botReply(text) {
  const answer = answerFor(text);
  return withinOpeningHours() ? answer : `${answer}<br><br>${OFFLINE_NOTE}`;
}

function answerFor(text) {
  const t = (text || "").toLowerCase();
  if (/(pris|koste|kr|betal|moms|gratis|prøve)/.test(t))
    return `De første <b>14 dage er gratis</b>. Derefter koster Birdly <b>${priceText.monthly}</b> eller <b>${priceText.yearly}</b> (ekskl. moms) — alt inkluderet. Vælger du årligt, sparer du ~${YEARLY_SAVING.pct} % (svarer til ${YEARLY_SAVING.months} måneder gratis). Ingen binding — opsig med 30 dages varsel.`;
  if (/(pakke|spurv|falk|eagle|albatros|region|storebælt|dækning|hele danmark|tier)/.test(t))
    return `Der er <b>én pakke</b> med alt inkluderet — ${priceText.perMonthBoth} (ekskl. moms). Du vælger selv, om du vil dække <b>én region eller hele Danmark</b>, og det er den samme pris uanset.`;
  if (/(opsig|stop|afmeld|stoppe|fortryd)/.test(t))
    return "Det er nemt: skriv <b>STOP</b> på en SMS, brug opsigelsesboksen nederst på siden, eller klik linket i bunden af vores mails. 30 dages varsel. Lige så simpelt som at tilmelde sig.";
  if (/(login|log ind|konto|kodeord|opsætning|platform)/.test(t))
    return "Du skal hverken logge ind eller sætte noget op. Alt kommer til dig på <b>SMS og mail</b>.";
  if (/(hvor.*udbud|kilde|hvor kommer|datakilde|udbud.dk|ted)/.test(t))
    return "Vi henter udbud fra de officielle kilder: <b>udbud.dk</b> og EU’s database <b>TED</b>. Offentlige udbud skal være åbne for alle.";
  if (/(virker|hvordan|kom i gang|tilmeld|start|hurtig|hvornår|besked)/.test(t))
    return "Du udfylder få oplysninger (fag, område, størrelse) — det tager 2 min. Så holder vi øje for dig og sender en <b>SMS + kort mail</b> med resumé, frist og link, så snart der er et match.";
  // Intet nøgleord ramte. Offline-noten hæftes på af botReply(), så her står kun
  // selve svaret.
  return "Hej! Jeg er Birdlys assistent 🕊️ — spørg løs, eller skriv til <b>support@birdly.dk</b>.";
}

export default function Forside({ opgaveTal, funnelHref = "/kom-i-gang" }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [cMail, setCMail] = useState("");      // opsig-email = KONTROLLERET state (ikke ref)
  const [cancelErr, setCancelErr] = useState(""); // synlig inline-fejl (ikke blokerbar alert)
  const bodyRef = useRef(null);

  /* scroll-reveal (IntersectionObserver) */
  useEffect(() => {
    const els = document.querySelectorAll(".birdly-home .reveal");
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* toggle body.chat-open så launcher-ikon + panel-CSS virker */
  useEffect(() => {
    document.body.classList.toggle("chat-open", chatOpen);
    return () => document.body.classList.remove("chat-open");
  }, [chatOpen]);

  /* auto-scroll chat-body til bund ved nye beskeder */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  function openChat() {
    setChatOpen(true);
    if (!chatStarted) {
      setChatStarted(true);
      setMessages([
        {
          who: "bot",
          html:
            "Hej! 👋 Jeg er Birdlys assistent. Spørg mig om priser, pakker, eller hvordan det virker — eller vælg et af spørgsmålene herunder.",
        },
      ]);
    }
  }

  function handleUser(text) {
    text = (text || "").trim();
    if (!text) return;
    setMessages((m) => [...m, { who: "user", html: text }]);
    setChatInput("");
    // Log beskeden i support_messages (source='chat', status='ny' => opfylder anon-RLS).
    // Fire-and-forget: chat-UX må aldrig blokere/fejle, hvis logningen svigter.
    insertRow("support_messages", { message: text, source: "chat", status: "ny" }).catch(
      () => {}
    );
    setTimeout(() => {
      setMessages((m) => [...m, { who: "bot", html: botReply(text) }]);
    }, 450);
  }

  function onCancel() {
    const m = cMail.trim();
    if (!m) {
      // Synlig fejl i boksen (en gentaget alert kan blive blokeret af browseren →
      // så ligner et klik "intet sker"). Åbner IKKE popup'en uden email.
      setCancelErr("Skriv din email for at opsige.");
      return;
    }
    // To-trins-opsigelse: åbn feedback-popup'en (Trin 1). Selve opsigelsen sker
    // FØRST når kunden klikker bekræftelseslinket i mailen (Trin 2). Den
    // offentlige side opsiger aldrig direkte.
    setCancelErr("");
    setCancelOpen(true);
  }

  return (
    /* ══════════════════════════════════════════════════════════════════════════
       RODEN — SALGS-LAGET ØVERST, SEO-LAGET UNDER FOLDEN (06-09-2026).

       ⚠️ TO LAG, ÉN SIDE. Øverst står præcis de samme sektioner som
       /kom-i-gang bruger (components/salg/Sektioner.js) — samme løfte, samme
       priser, samme garanti-ordlyd. Under dem ligger rodens SEO-lag: de tolv
       FAQ-svar, forklaringssektionerne, fag-chippene og "om os". Det er DÉT
       indhold der gør roden til husets stærkeste URL, og det står urørt.

       ⚠️ HVORFOR .birdly-home STADIG OMSLUTTER DET HELE. Launch-baren og
       pris-streameren har deres CSS nested inde i .birdly-home i forside.css.
       Lå salgs-blokken udenfor, ville de to stå ustylede i launch-fasen. De
       vælgere i forside.css der kunne ramme salgs-sektionerne (section-padding,
       details, summary) er derfor overtrumfet i salg.css med to klasser — se
       noten dér.

       ⚠️ HVAD DER ER FJERNET HERFRA OG HVORFOR:
         · den gamle hero            → erstattet af <Hero>, som sælger resultatet
         · "pain"-sektionen          → <Problemet> siger det samme, kortere
         · "Fra besvær til besked"   → <Motoren>, tre trin i stedet for fire
         · pris-sektionen            → <Priser> (samme beløb, ny ramme + garanti)
         · B2C-båndet midt i flowet  → <EfterspoergselsLink> nederst + headeren
       Intet af det er slettet indhold: hver sektion har en afløser der siger det
       samme bedre. Det eneste der reelt er væk, er dubletterne.
       ══════════════════════════════════════════════════════════════════════════ */
    <FagProvider start="rengoring"><div className="birdly-home sg">
      {/* Launch-baren ligger øverst, som før. Renderer sig selv væk uden for
          launch-fasen (NEXT_PUBLIC_LAUNCH_DEADLINE). */}
      <LaunchBanner />
      <SalgHeader funnelHref={funnelHref} />

      {/* ⚠️ OpgaveTaeller ER FJERNET HERFRA. Baren viste det samme tal som
          <BevisBjaelke> nu viser, to skærmcentimeter fra hinanden — to steder
          der siger "446 opgaver" læses som to forskellige tal. Komponenten er
          urørt og bruges stadig på /brancher og fag-siderne. */}

      {/* ⚠️ SAMME RÆKKEFØLGE SOM /kom-i-gang. Den psykologiske arkitektur er
          dokumenteret ét sted — components/salg/Salgsside.js — og skal holdes i
          takt her. To forskellige rækkefølger på det samme indhold ville betyde
          at vi optimerede to sider og lærte af ingen af dem. */}
      <Hero funnelHref={funnelHref} />
      <BevisBjaelke tal={opgaveTal} />
      <RisikoFjernet funnelHref={funnelHref} />
      <Problemet />
      <ProblemPris fag="rengoring" />
      <Loesningen funnelHref={funnelHref} />
      <FagBevis funnelHref={funnelHref} />
      <Motoren funnelHref={funnelHref} />
      <SmsDemo fag="rengoring" />
      <FagVaelgerKort />
      {/* ⚠️ <SmsDemo /> STÅR IKKE HER, OG DET ER MED VILJE. Roden har allerede
          "Beskeden du får — Kort og godt" nede i SEO-laget, med præcis de samme
          fire punkter (resumé, frist, link, bud-skabelon) og et mail-kort ved
          siden af. To sektioner der siger det samme med de samme fire linjer på
          én side er dårlig læsning og unødig intern dublet. Salgssiden og
          /sadan-virker-det HAR den — de har ikke SEO-halen. */}
      <Vaerdi funnelHref={funnelHref} />
      <Kundebevis />
      <IkkePortal />

      {/* Pris-streameren hører til ved prisen og har sin CSS nested i
          .birdly-home — derfor står den her og ikke inde i <Priser>, som også
          bruges på /kom-i-gang hvor .birdly-home ikke findes. */}
      <LaunchStreamer />
      <Priser funnelHref={funnelHref} />
      <SlutCta funnelHref={funnelHref} />

      {/* ══════════════════════════════════════════════════════════════════════
          HERUNDER: SEO-LAGET. Rodens eget indhold — det Google rangerer den på,
          og det en organisk besøgende læser efter at have set salgsargumentet.
          ⚠️ RØR DET IKKE UDEN GRUND. Fag-chippene er interne links til alle 20
          brancheshelf-sider, og de tolv FAQ-svar fodrer FAQPage-schemaet i
          app/page.js. Fjernes et af dem, falder både interne links og schema.
          ══════════════════════════════════════════════════════════════════════ */}

      {/* MARQUEE */}
      <section className="marq-sec">
        <div className="wrap">
          <div className="lbl reveal">Birdly er for SMV-virksomheder i hele Danmark</div>
          <p className="sml reveal">Stort set alle brancher. Du skal bare gøre det, du er god til — dit håndværk og din service. Vi sender en SMS i det øjeblik, en opgave passer til dig, så du bruger mindre tid på at lede.</p>
        </div>
        <div className="track" id="t1">
          {brands.concat(brands).map((b, i) => (
            <Link className="chip" href={"/fag/" + b.slug} key={i}><i></i>{b.label}</Link>
          ))}
        </div>
      </section>

      {/* EXAMPLES / MESSAGE */}
      <section className="examples">
        <div className="wrap">
          <div className="ex-grid">
            <div className="ex-copy reveal">
              <span className="kick">Beskeden du får</span>
              <h2>Kort og godt — mere behøves ikke.</h2>
              <p>Ja, det er "bare" en SMS og en mail. Og det er præcis det, der gør os anderledes. Vi har pakket alt det bøvlede ind i én simpel besked, du kan handle på med det samme.</p>
              <ul>
                <li><span className="t"><svg width="15" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#00B3A6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Resumé på 3 linjer</li>
                <li><span className="t"><svg width="15" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#00B3A6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Frist og dato</li>
                <li><span className="t"><svg width="15" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#00B3A6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Direkte link til opgaven</li>
                <li><span className="t"><svg width="15" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#00B3A6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Bud-skabelon, klar til at udfylde</li>
              </ul>
            </div>
            <div className="mailcard reveal">
              <div className="from">
                <span className="ic"><svg width="17" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
                <b>Birdly<span style={{ color: "var(--sky)" }}>.dk</span></b><span className="on">Se online</span>
              </div>
              <h4>Hej Mads</h4>
              <p className="pre">Her er dit nyeste opgavematch. Kort, relevant og klar til handling.</p>
              <div className="inner">
                <span className="ico"><svg width="18" viewBox="0 0 24 24" fill="none"><path d="M4 20V8l8-5 8 5v12" stroke="#0D1B2A" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 20v-6h6v6" stroke="#0D1B2A" strokeWidth="1.7" /></svg></span>
                <div>
                  <div className="ttl">Renovering af skoler</div>
                  <div className="meta">Aarhus Kommune · Frist: 14.08.2026 kl. 12.00</div>
                  <Link className="seebtn" href="/kom-i-gang">Se opgaven</Link>
                </div>
              </div>
              <div className="sign">Vi finder — du vælger.<br />Venlig hilsen<br /><b>Birdly Teamet</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* SKABELON — Din bud-skabelon (vis forskellen: grøn = udfyldt af Birdly, gul = udfyld selv) */}
      <section className="skab" id="skabelon">
        <div className="wrap">
          <div className="skab-grid">
            <div className="skab-copy reveal">
              <span className="kick">Din bud-skabelon</span>
              <h2>Vi finder ikke bare opgaven — vi hjælper dig i gang</h2>
              <p>Når vi sender dig en relevant opgave, har vi allerede gjort cirka 70 % af tilbuddet klar — krav, frister og det formelle. De sidste 30 % er det, kun du kender: din pris, dine referencer og din beskrivelse af opgaven.</p>
              <p className="skab-honest">Vi laver ikke tilbuddet for dig — men vi gør det meste af benarbejdet, så du hurtigt kan komme i gang.</p>
            </div>
            <div className="skab-card reveal">
              <div className="skab-cardh">
                <span className="ic"><svg width="17" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
                <b>Bud-skabelon</b><span className="ex">uddrag</span>
              </div>
              <div className="skab-row green"><span className="skab-state">🟢 Udfyldt af Birdly</span><span className="skab-val">Ordregiver, frist &amp; krav</span></div>
              <div className="skab-row green"><span className="skab-state">🟢 Udfyldt af Birdly</span><span className="skab-val">ESPD &amp; formalia</span></div>
              <div className="skab-row yellow"><span className="skab-state">🟡 Udfyld selv</span><span className="skab-val">Din pris</span></div>
              <div className="skab-row yellow"><span className="skab-state">🟡 Udfyld selv</span><span className="skab-val">Dine referencer</span></div>
              <div className="skab-legend"><span><i className="dot green"></i> Udfyldt af Birdly</span><span><i className="dot yellow"></i> Udfyld selv</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section>
        <div className="wrap">
          <div className="center reveal">
            <span className="kick">Sådan er vi</span>
            <h2 className="big">Derfor er Birdly anderledes.</h2>
            <p className="lead">Andre løsninger giver dig adgang til store udbudsportaler, hvor du selv skal søge og holde øje. Birdly gør det omvendte:</p>
            <p className="owner-line reveal">Du fortæller os, hvilke opgaver du leder efter. Vi holder øje. Du får besked.</p>
            <p className="lead">Så enkelt er det.</p>
          </div>
          <div className="vals">
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 12h10" stroke="#2EB7FF" strokeWidth="2.2" strokeLinecap="round" /><path d="M11 7.5l4.5 4.5L11 16.5" stroke="#2EB7FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="20" cy="12" r="1.9" fill="#00B3A6" /></svg></div><h4>Ingen portal</h4><p>Du logger ikke ind nogen steder. Alt kommer i én SMS og mail.</p></div>
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M19 4C11 4 5 10 5 18c8 0 14-6 14-14z" stroke="#2EB7FF" strokeWidth="2" strokeLinejoin="round" /><path d="M17.5 5.5L7 16" stroke="#00B3A6" strokeWidth="1.8" strokeLinecap="round" /><path d="M13.6 6.3h-2.3M11 9H8.7M8.7 11.6H6.4" stroke="#00B3A6" strokeWidth="1.5" strokeLinecap="round" /></svg></div><h4>Én samlet besked</h4><p>Dagens relevante opgaver samlet i én besked. Ingen spam.</p></div>
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="9" rx="4.5" stroke="#2EB7FF" strokeWidth="2" /><circle cx="16.5" cy="12.5" r="2.7" fill="#00B3A6" /></svg></div><h4>Ingen binding, ingen sælgere</h4><p>Opsig når du vil. Vi holder på dig med produktet, ikke en kontrakt.</p></div>
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.6v5.4c0 4.3-3 7.4-7 9-4-1.6-7-4.7-7-9V5.6L12 3z" stroke="#2EB7FF" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2.2 2.2L15 9.8" stroke="#00B3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><h4>Bud-skabelon med i linket</h4><p>Ca. 70 % af tilbuddet er gjort klar, så du hurtigt kan byde.</p></div>
          </div>
        </div>
      </section>

      {/* DE RIGTIGE OPGAVER — ny sektion før priserne, samme sektions-stil som naboerne */}
      <section>
        <div className="wrap">
          <div className="center reveal">
            <h2 className="big">Du skal ikke finde flere opgaver.<br />Du skal finde de rigtige.</h2>
            <p className="lead">Der findes masser af opgaver. Problemet er at finde dem, der faktisk passer til din virksomhed. Du vælger fag, område og type — Birdly sorterer resten.</p>
            <p className="owner-line reveal">Du bestemmer selv fag, område, opgavetype og kontraktværdi. Birdly sender kun opgaver, der matcher dine valg.</p>
          </div>
        </div>
      </section>

      {/* ⚠️ DEN GAMLE PRIS-SEKTION ER FJERNET HER. Beløbene var de samme
          (begge læste lib/pakke.js), men den stod med et UBETINGET
          garanti-argument i "price-note" og gentog priserne en anden gang på
          samme side. Prisen bor nu ét sted: <Priser> længere oppe, med den
          betingede matchgaranti fra lib/salgTekst.js. */}

      {/* ABOUT */}
      <section className="about" id="om">
        <div className="wrap">
          <div className="about-grid">
            <div className="reveal">
              <span className="kick" style={{ color: "var(--sky)" }}>Om os</span>
              <h2>Bygget af folk, der selv har siddet i den anden ende.</h2>
              <p>Gennem mange år i grossist- og produktionsleddet har vi selv mærket, hvor besværligt og tidskrævende det er at finde de opgaver, der rent faktisk passer. Derfor lavede vi Birdly — det stik modsatte af en stor, støvet udbudsportal.</p>
              <p>Vi gør én ting: matcher konkrete opgaver med din virksomhed og sender dig en simpel besked. Resten kan du selv.</p>
              <div className="sign">Folkene bag Birdly</div>
            </div>
            <div className="promise reveal">
              <div className="h"><svg width="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="6" stroke="#2EB7FF" strokeWidth="2" /><path d="M8 14l-2 8 6-3 6 3-2-8" stroke="#2EB7FF" strokeWidth="2" strokeLinejoin="round" /></svg> Vores løfte</div>
              <p>Vi sender kun, når der er et match. Du hører kun fra os, når det giver mening — aldrig spam, aldrig en sælger i røret.</p>
              <p style={{ marginTop: 14 }}><b style={{ color: "#fff" }}>Mere relevans. Mindre bøvl. Ingen spam.</b></p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="wrap">
          <div className="center reveal">
            <span className="kick">FAQ</span>
            <h2 className="big">Det, du tænker lige nu.</h2>
          </div>
          {/* ⚠️ TEKSTEN ER FLYTTET, IKKE SLETTET. Alle 12 spørgsmål bor nu i
              lib/faq.js, som salgssiden på roden også læser. Stod de to steder,
              ville svarene langsomt drive fra hinanden — samme fælde som
              match-reglens to kopier (CLAUDE.md). */}
          <div className="faq-list">
            {FAQ.map((q) => (
              <details className="reveal" key={q.sp}>
                <summary>{q.sp} <span className="pm">+</span></summary>
                <p>{q.svar}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNUP / KOM I GANG */}
      <section className="signup" id="kom-i-gang">
        <div className="wrap">
          <div className="su-grid">
            <div className="reveal">
              <span className="kick">Sådan starter du</span>
              <h2>Få dit første match — gratis i 14 dage.</h2>
              <p className="lead">Udfyld få oplysninger, så holder Birdly øje for dig. Du hører fra os, så snart der er en opgave, der passer.</p>
              <ul>
                <li><svg width="22" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> 14 dage gratis — ingen binding</li>
                <li><svg width="22" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Intet login, ingen opsætning</li>
                <li><svg width="22" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Stop når du vil</li>
              </ul>
            </div>
            <div className="fcard reveal" style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--sky-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="30" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#2EB7FF" strokeWidth="2.6" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#00B3A6" strokeWidth="2.6" strokeLinecap="round" /></svg>
              </div>
              <h3>Opret din profil på to minutter</h3>
              <p className="ft" style={{ marginBottom: 20 }}>Du udfylder dit fag, område og opgavestørrelse — så finder vi de mest relevante opgaver til dig. Gratis i 14 dage. Ingen binding — opsig når du vil.</p>
              <Link href="/kom-i-gang" className="submit" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>Find opgaver nu</Link>
              <p className="fnote">Gratis de første 14 dage · ingen binding</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="ctaband">
        <div className="wrap">
          <h2 className="reveal">Klar til at få opgaver direkte på SMS?</h2>
          <p className="reveal">Lad Birdly holde øje, så du kan bruge tiden på det, du er god til.</p>
          <Link href="/kom-i-gang" className="btn btn-teal reveal">Find opgaver nu</Link>
          <p className="cta-note reveal">Gratis de første 14 dage · ingen binding</p>
        </div>
      </section>

      {/* CANCEL / OPSIGELSE */}
      <section className="cancel" id="opsigelse">
        <div className="wrap">
          <div className="cbox reveal">
            <h2>Bye bye, Birdly 👋</h2>
            <p className="lead">Ja — hos os er det lige så nemt at opsige, som det var at tilmelde sig. Måske endda nemmere. Skriv dine oplysninger her, så opsiger vi med 30 dages varsel.</p>
            <div className="cancel-form">
              <input id="cMail" type="email" placeholder="Din email" value={cMail}
                onChange={(e) => { setCMail(e.target.value); if (cancelErr) setCancelErr(""); }} />
              <input id="cTlf" type="tel" placeholder="Dit telefonnummer" />
              <button type="button" id="cGo" onClick={onCancel}>Opsig Birdly</button>
            </div>
            {cancelErr && <p style={{ color: "#c8552e", fontSize: 13, margin: "10px 0 0" }}>{cancelErr}</p>}
            <p className="psst">Psst … vi håber at se dig snart igen.</p>
          </div>
        </div>
      </section>

      <EfterspoergselsLink />

      <Footer />

      {/* OPSIGELSES-FEEDBACK-POPUP (Trin 1 — feedback + "tjek din mail") */}
      <OpsigPopup
        open={cancelOpen}
        email={cMail}
        onClose={() => setCancelOpen(false)}
      />

      <StickyCtaMobil funnelHref={funnelHref} />

      {/* CHAT SUPPORT WIDGET */}
      <button className="chat-launcher" id="chatLauncher" aria-label="Åbn support-chat" onClick={() => (chatOpen ? setChatOpen(false) : openChat())}>
        <span className="dot"></span>
        <svg className="open-i" width="26" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H9l-4 4V5z" fill="#fff" /></svg>
        <svg className="close-i" width="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
      </button>
      <div className="chat-panel" id="chatPanel" role="dialog" aria-label="Birdly support">
        <div className="chat-head">
          <span className="av"><svg width="20" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
          <div><div className="ti">Birdly Support</div><div className="st"><i></i> Svarer typisk med det samme</div></div>
          <button className="x" id="chatClose" aria-label="Luk chat" onClick={() => setChatOpen(false)}>✕</button>
        </div>
        <div className="chat-body" id="chatBody" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={"cmsg " + m.who} dangerouslySetInnerHTML={{ __html: m.html }} />
          ))}
        </div>
        <div className="quick" id="chatQuick">
          {quickQs.map((q) => (
            <button key={q} onClick={() => handleUser(q)}>{q}</button>
          ))}
        </div>
        <div className="chat-foot">
          <input
            id="chatInput"
            placeholder="Skriv dit spørgsmål …"
            autoComplete="off"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleUser(chatInput); }}
          />
          <button id="chatSend" aria-label="Send besked" onClick={() => handleUser(chatInput)}><svg width="20" viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-7-8-3z" fill="#fff" /></svg></button>
        </div>
        <div className="chat-note">Drevet af Birdly</div>
      </div>
    </div></FagProvider>
  );
}
