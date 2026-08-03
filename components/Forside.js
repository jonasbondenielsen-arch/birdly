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
import "../app/forside.css";

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
// Åbningstid: man–fre 08–18 (lokal tid). Kun til at vælge fallback-tekst —
// rører ikke svar-logikken eller at assistenten er AI-drevet.
function withinOpeningHours() {
  const now = new Date();
  const day = now.getDay(); // 0 = søndag, 6 = lørdag
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}

function botReply(text) {
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
  return withinOpeningHours()
    ? "Hej! Jeg er Birdlys assistent 🕊️ — spørg løs, eller skriv til <b>support@birdly.dk</b>."
    : "Lige nu er fuglen fløjet 🕊️ Vi er online alle hverdage kl. 08:00–18:00 og er tilbage på pinden i morgen. Skriv endelig dit spørgsmål eller send en mail til <b>support@birdly.dk</b> — så vender vi tilbage.";
}

export default function Forside({ opgaveTal = null }) {
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
    <div className="birdly-home">
      {/* Sticky stak: launch-banner (kun i launch-fasen) + header følges ad ned ved scroll. */}
      <div className="topstack">
        <LaunchBanner />
        {/* HEADER */}
        <header>
          <div className="wrap bar">
            <Logo height={32} />
            <nav className="menu">
              <a href="#hvorfor">Hvorfor Birdly</a>
              <a href="#hvordan">Hvordan virker det</a>
              <a href="#priser">Priser</a>
              <a href="#faq">FAQ</a>
              <a href="#om">Om os</a>
              <Link href="/udbud-for-alle">Opgaver er for alle</Link>
              {/* Branchesiderne kunne før kun nås fra footeren — en besøgende på forsiden
                  fandt dem aldrig. "Find dit fag" frem for "Brancher": det er dét den
                  besøgende vil, ikke hvad siden hedder. */}
              <Link href="/brancher">Find dit fag</Link>
            </nav>
            <div className="right">
              <Link href="/kom-i-gang" className="nav-cta">Find opgaver nu</Link>
            </div>
          </div>
        </header>
        {/* Tælleren ligger INDE i .topstack, så den følger headeren ned ved scroll og
            arver stakkens z-index frem for at få sit eget lag. */}
        <OpgaveTaeller tal={opgaveTal} />
      </div>

      {/* HERO */}
      <section className="hero" style={{ padding: 0 }}>
        <div className="wrap hero-grid">
          <div>
            <span className="pill">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <path d="M5 7h14M5 12h14M5 17h9" stroke="#2EB7FF" strokeWidth="2.2" strokeLinecap="round" />
              </svg>{" "}
              Brevduen for offentlige opgaver
            </span>
            <h1>Offentlige opgaver.<br />Direkte på <span className="sky-em">SMS.</span></h1>
            {/* ⚠️ KUN TEKSTEN (03-08-2026). Samme <p className="sub"> som før — ingen
                ny klasse, ingen ny margin. <br /> deler den i to linjer, fordi
                sætningerne siger to forskellige ting: hvad du får, og hvad du slipper
                for. "relevante" er bevidst væk; resten af copy'en siger "passer". */}
            <p className="sub">
              Du får kun besked, når der er en offentlig opgave, der passer til din virksomhed.
              <br />
              Ingen søgning. Ingen portal. Kun de opgaver, der passer til dig — direkte på SMS og mail.
            </p>
            <div className="checks">
              <span>
                <svg width="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>{" "}
                Kun opgaver, der passer til dig
              </span>
              <span>
                <svg width="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>{" "}
                Direkte på SMS og mail
              </span>
            </div>
            <div className="cta">
              <div className="cta-primary">
                <Link href="/kom-i-gang" className="btn btn-teal">Find opgaver nu</Link>
                <span className="cta-note">Gratis de første 14 dage · ingen binding</span>
              </div>
              <a href="#hvordan" className="btn btn-ghost">Se hvordan det virker</a>
            </div>
          </div>
          <div className="stage">
            <div className="phone">
              <div className="notch"></div>
              <div className="screen">
                <div className="stat"><span>9.41</span><span>•••• ⌃ ▮</span></div>
                <div className="smscard">
                  <div className="hd">
                    <span className="ic"><svg width="15" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
                    <span className="nm">BIRDLY</span><span className="tm">nu</span>
                  </div>
                  <div className="t">Nyt opgavematch</div>
                  <div className="row">Aarhus Kommune<br />Renovering af skoler<br />Frist: 14.08.2026<br /><span className="lnk">birdly.dk/m/abc123</span></div>
                  <div className="stop">Svar STOP for at afmelde</div>
                </div>
                <div className="matchcard">
                  <div className="top"><span className="tick"><svg width="12" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Dit match</div>
                  <h4>Renovering af skoler</h4>
                  <div className="muni">Aarhus Kommune</div>
                  <div className="li"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="#FF6B6B" strokeWidth="1.6" /><path d="M2 6h12M6 1.5v3M10 1.5v3" stroke="#FF6B6B" strokeWidth="1.6" strokeLinecap="round" /></svg> Frist: 14.08.2026</div>
                  <div className="li"><svg viewBox="0 0 16 16"><path d="M8 1v14M4 5l4-4 4 4" stroke="#00B3A6" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Budget: 25–40 mio. kr.</div>
                  <Link className="see" href="/kom-i-gang">Se opgaven →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIP FOR AT HOLDE ØJE — ny sektion, samme sektions- og tekst-stil som naboerne */}
      <section>
        <div className="wrap">
          <div className="center reveal">
            <h2 className="big">Slip for selv at holde øje med offentlige opgaver.</h2>
            <p className="lead">Hver dag offentliggøres nye opgaver. Birdly holder automatisk øje med dem for dig og sender kun dem, der matcher din virksomhed. Du bruger tiden på kunder og projekter — ikke på søgninger.</p>
            <p className="owner-line reveal">Du fortæller os, hvilke opgaver du leder efter. Vi holder øje. Du får besked.</p>
          </div>
        </div>
      </section>

      {/* PAIN / HVORFOR */}
      <section className="pain" id="hvorfor">
        <div className="wrap">
          <div className="center reveal">
            <span className="kick">Kender du det?</span>
            <h2 className="big">Opgaverne er der.<br />De er bare svære at finde.</h2>
            <p className="lead">Mange firmaer går glip af gode opgaver fra det offentlige — de ligger spredt, og fristen er der, før man opdager dem.</p>
          </div>
          <div className="pain-grid">
            <div className="pcard reveal">
              <div className="ic"><svg width="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FF6B6B" strokeWidth="2" /><path d="M12 7v5l3 2" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Du ser dem for sent</h3>
              <p>Fristen er der tit, før du overhovedet opdager opgaven.</p>
            </div>
            <div className="pcard reveal">
              <div className="ic"><svg width="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" /></svg></div>
              <h3>De ligger spredt</h3>
              <p>Opgaverne er fordelt på tunge portaler med login. At holde øje koster timer hver uge.</p>
            </div>
            <div className="pcard reveal">
              <div className="ic"><svg width="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2v6h6" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 13H8M16 17H8M10 9H8" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Buddet tager tid</h3>
              <p>Når du endelig finder en opgave, æder selve tilbuddet de timer, du ikke har.</p>
            </div>
          </div>
          <p className="pain-bridge reveal">Du får beskeden om de rette opgaver — og en skabelon klar, hvis du vil byde. Resten bestemmer du selv.</p>
        </div>
      </section>

      {/* HOW */}
      <section id="hvordan">
        <div className="wrap">
          <div className="center reveal">
            <span className="kick">Hvordan virker det</span>
            <h2 className="big">Fra besvær til besked.</h2>
            <p className="lead">Du gør det nemme. Vi gør resten. Du hører kun fra os, når der er et match.</p>
          </div>
          <div className="steps">
            <div className="stp reveal"><div className="num">1</div><h3>Fortæl os hvad du laver</h3><p>Vælg branche, område og ønsket opgavestørrelse. Det tager få minutter.</p></div>
            <div className="stp reveal"><div className="num">2</div><h3>Birdly holder øje</h3><p>Vi holder øje med relevante offentlige opgaver. Du behøver ikke logge ind eller søge hver dag.</p></div>
            <div className="stp reveal"><div className="num">3</div><h3>Få besked</h3><p>Når vi finder relevante opgaver, får du én samlet besked med dagens matches.</p></div>
            <div className="stp reveal"><div className="num">4</div><h3>Vi hjælper dig i mål</h3><p>Skabelonen følger med i linket. Brug den eller lad være — men den sparer mange for timers arbejde.</p></div>
          </div>
        </div>
      </section>

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
            <p className="lead">Der offentliggøres tusindvis af udbud. De færreste er relevante for netop din virksomhed. Birdly sorterer dem fra på forhånd, så du kun ser de opgaver, der passer til dine valg.</p>
            <p className="owner-line reveal">Du bestemmer selv fag, område, opgavetype og kontraktværdi. Birdly sender kun opgaver, der matcher dine valg.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="priser">
        <div className="wrap">
          <div className="center reveal">
            <span className="pill-incl">ALT INKLUDERET</span>
            <h2 className="big">Én pakke med det hele</h2>
            <p className="lead">Samme pris, uanset om du dækker din egen region eller hele Danmark.</p>
          </div>

          <LaunchStreamer />

          <div className="price-duo">
            {/* Boks A — månedligt */}
            <div className="pbox reveal">
              <div className="plabel">MÅNEDLIGT</div>
              <div className="pamt">{PLAN.monthly}<span>kr/md</span></div>
              <div className="pnote">Ekskl. moms · ingen binding</div>
              <div className="pfoot">
                <Link href="/kom-i-gang" className="btn btn-teal pbtn">Find opgaver nu</Link>
                <div className="cta-note">Gratis de første 14 dage · ingen binding</div>
                <div className="psub">Opsig når som helst med 30 dages varsel.</div>
              </div>
            </div>

            {/* Boks B — årligt (fremhævet) */}
            <div className="pbox feat reveal">
              <span className="psave">SPAR ~{YEARLY_SAVING.pct} %</span>
              <div className="plabel">ÅRLIGT</div>
              <div className="pamt">{PLAN.yearly.toLocaleString("da-DK")}<span>kr/år</span></div>
              <div className="pnote">Betal for 10 måneder, få 12 · spar {YEARLY_SAVING.amount} kr · ekskl. moms</div>
              <div className="pfoot">
                <Link href="/kom-i-gang" className="btn btn-teal pbtn">Find opgaver nu</Link>
                <div className="cta-note">Gratis de første 14 dage · ingen binding</div>
                {/* TODO jura: "betales forud" er en blød, MIDLERTIDIG formulering. Den præcise
                    ordlyd om 12-måneders binding på årsabonnement skal bekræftes af advokat før launch. */}
                <div className="psub">Årsabonnement — betales forud.</div>
              </div>
            </div>
          </div>

          <div className="price-incl reveal">
            <h3>Det får du — uanset hvad du vælger</h3>
            <ul>
              <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Alle kommunale &amp; statslige opgaver — i <b>din region eller hele Danmark</b>, samme pris</span></li>
              <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>SMS + mail ved match — resumé, dato og link</span></li>
              <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Bud-skabelon inkluderet</span></li>
              <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Betal månedligt — eller spar ~{YEARLY_SAVING.pct} % på årsbetaling</span></li>
              <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>14 dage gratis · ingen binding · opsig når som helst</span></li>
            </ul>
          </div>

          <p className="price-note">En enkelt offentlig opgave kan betale abonnementet mange gange hjem. De første 14 dage er gratis — opsiger du inden da, trækkes der intet. Alle priser er ekskl. moms.</p>
        </div>
      </section>

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
              <span className="kick">Kom i gang</span>
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

      <Footer />

      {/* OPSIGELSES-FEEDBACK-POPUP (Trin 1 — feedback + "tjek din mail") */}
      <OpsigPopup
        open={cancelOpen}
        email={cMail}
        onClose={() => setCancelOpen(false)}
      />

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
    </div>
  );
}
