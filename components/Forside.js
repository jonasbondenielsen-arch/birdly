"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Footer from "./Footer";
import OpsigPopup from "./OpsigPopup";
import { Logo } from "./Logo";
import { insertRow } from "../lib/supabase";
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
    return "De første <b>14 dage er gratis</b>. Derefter overgår du til prisen for din plan, som trækkes automatisk efter prøveperioden og fornyes hver måned: Spurv 349,-, Falk 499,- eller Albatros 1.199,- pr. md. (ekskl. moms). Ingen binding — opsig med 30 dages varsel.";
  if (/(pakke|spurv|falk|eagle|albatros|region|storebælt|dækning|hele danmark)/.test(t))
    return "Vi har tre pakker:<br><b>Spurv</b> — udbud i én region, du selv vælger.<br><b>Falk</b> — alle regioner vest eller øst for Storebælt.<br><b>Albatros</b> — udbud i hele Danmark.";
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

export default function Forside() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const cMailRef = useRef(null);
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
    const m = (cMailRef.current?.value || "").trim();
    if (!m) {
      alert("Skriv din email for at opsige.");
      return;
    }
    // To-trins-opsigelse: åbn feedback-popup'en (Trin 1). Selve opsigelsen sker
    // FØRST når kunden klikker bekræftelseslinket i mailen (Trin 2) — bygges i
    // Deltrin 2/3. Den offentlige side opsiger aldrig direkte.
    setCancelOpen(true);
  }

  return (
    <div className="birdly-home">
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
            <Link href="/udbud-for-alle">Udbud er for alle</Link>
          </nav>
          <div className="right">
            <Link href="/tilmeld" className="nav-cta">Kom i gang</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" style={{ padding: 0 }}>
        <div className="wrap hero-grid">
          <div>
            <span className="pill">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <path d="M5 7h14M5 12h14M5 17h9" stroke="#2EB7FF" strokeWidth="2.2" strokeLinecap="round" />
              </svg>{" "}
              Brevduen for offentlige udbud
            </span>
            <h1>Offentlige opgaver.<br />Direkte på <span className="sky-em">SMS.</span></h1>
            <p className="sub">Kommuner, regioner og staten køber hver dag ind hos private firmaer. Birdly finder de opgaver, der passer til dit fag og dit område — og sender dig en SMS, når der er et match. Ingen portal. Ingen søgning. Ingen sælgere.</p>
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
              <Link href="/tilmeld" className="btn btn-teal">Kom i gang — gratis i 14 dage</Link>
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
                  <div className="t">Nyt udbudsmatch</div>
                  <div className="row">Aarhus Kommune<br />Renovering af skoler<br />Frist: 14.08.2026<br /><span className="lnk">birdly.dk/m/abc123</span></div>
                  <div className="stop">Svar STOP for at afmelde</div>
                </div>
                <div className="matchcard">
                  <div className="top"><span className="tick"><svg width="12" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Dit match</div>
                  <h4>Renovering af skoler</h4>
                  <div className="muni">Aarhus Kommune</div>
                  <div className="li"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="#FF6B6B" strokeWidth="1.6" /><path d="M2 6h12M6 1.5v3M10 1.5v3" stroke="#FF6B6B" strokeWidth="1.6" strokeLinecap="round" /></svg> Frist: 14.08.2026</div>
                  <div className="li"><svg viewBox="0 0 16 16"><path d="M8 1v14M4 5l4-4 4 4" stroke="#00B3A6" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Budget: 25–40 mio. kr.</div>
                  <Link className="see" href="/tilmeld">Se udbuddet →</Link>
                </div>
              </div>
            </div>
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
              <h3>Du ser det for sent</h3>
              <p>Fristen er der tit, før du overhovedet opdager opgaven.</p>
            </div>
            <div className="pcard reveal">
              <div className="ic"><svg width="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" /></svg></div>
              <h3>Portalerne er tunge</h3>
              <p>Indviklede sider og login. Du bruger timer på at lede.</p>
            </div>
            <div className="pcard reveal">
              <div className="ic"><svg width="22" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M7 6h7a3 3 0 010 6H8a3 3 0 000 6h8" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>De store er dyre</h3>
              <p>Høje priser og lange bindinger — før du ved, om det er noget for dig.</p>
            </div>
          </div>
          <p className="pain-bridge reveal">Vi gør det hurtigt og enkelt — med en skabelon, der har det meste af tilbuddet klar, så du sparer timer.</p>
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
            <div className="stp reveal"><div className="num">1</div><h3>Udfyld få oplysninger</h3><p>Fag, område og størrelse. Det tager to minutter — og du skal ikke logge ind.</p></div>
            <div className="stp reveal"><div className="num">2</div><h3>Vi holder øje for dig</h3><p>Birdly følger alle nye offentlige udbud hver dag — også dem, der er på vej.</p></div>
            <div className="stp reveal"><div className="num">3</div><h3>Du får en SMS</h3><p>Er der et match, får du en SMS og en kort mail med resumé, frist og link.</p></div>
            <div className="stp reveal"><div className="num">4</div><h3>Vi hjælper dig i mål</h3><p>Skabelonen følger med i linket. Brug den eller lad være — men den sparer mange for timers arbejde.</p></div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="marq-sec">
        <div className="wrap">
          <div className="lbl reveal">Birdly er for SMV-virksomheder i hele Danmark</div>
          <p className="sml reveal">Stort set alle brancher. Du skal bare gøre det, du er god til — dit håndværk og din service. Vi sender en SMS i det øjeblik, et udbud passer til dig, så du bruger mindre tid på at lede.</p>
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
                <li><span className="t"><svg width="15" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#00B3A6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Direkte link til udbuddet</li>
                <li><span className="t"><svg width="15" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-8" stroke="#00B3A6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Bud-skabelon, klar til at udfylde</li>
              </ul>
            </div>
            <div className="mailcard reveal">
              <div className="from">
                <span className="ic"><svg width="17" viewBox="0 0 28 28" fill="none"><path d="M4 17C8 11 11 11 14 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15C17 11 20 11 24 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
                <b>Birdly<span style={{ color: "var(--sky)" }}>.dk</span></b><span className="on">Se online</span>
              </div>
              <h4>Hej Mads</h4>
              <p className="pre">Her er dit nyeste udbudsmatch. Kort, relevant og klar til handling.</p>
              <div className="inner">
                <span className="ico"><svg width="18" viewBox="0 0 24 24" fill="none"><path d="M4 20V8l8-5 8 5v12" stroke="#0D1B2A" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 20v-6h6v6" stroke="#0D1B2A" strokeWidth="1.7" /></svg></span>
                <div>
                  <div className="ttl">Renovering af skoler</div>
                  <div className="meta">Aarhus Kommune · Frist: 14.08.2026 kl. 12.00</div>
                  <Link className="seebtn" href="/tilmeld">Se udbuddet</Link>
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
              <h2>Vi finder ikke bare udbuddet — vi hjælper dig i gang</h2>
              <p>Når vi sender dig et relevant udbud, har vi allerede gjort cirka 70 % af tilbuddet klar — krav, frister og det formelle. De sidste 30 % er det, kun du kender: din pris, dine referencer og din beskrivelse af opgaven.</p>
              <p className="skab-honest">Vi laver ikke dit udbud for dig — men vi gør det meste af benarbejdet, så du hurtigt kan komme i gang.</p>
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
            <h2 className="big">Vi er ikke som de store.</h2>
            <p className="lead">Vi gør én ting — og gør den enkelt. Det er hele idéen bag Birdly.</p>
          </div>
          <div className="vals">
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 12h10" stroke="#2EB7FF" strokeWidth="2.2" strokeLinecap="round" /><path d="M11 7.5l4.5 4.5L11 16.5" stroke="#2EB7FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="20" cy="12" r="1.9" fill="#00B3A6" /></svg></div><h4>Ingen login</h4><p>Ingen portal at logge ind på. Du får alt i en SMS og en mail.</p></div>
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M19 4C11 4 5 10 5 18c8 0 14-6 14-14z" stroke="#2EB7FF" strokeWidth="2" strokeLinejoin="round" /><path d="M17.5 5.5L7 16" stroke="#00B3A6" strokeWidth="1.8" strokeLinecap="round" /><path d="M13.6 6.3h-2.3M11 9H8.7M8.7 11.6H6.4" stroke="#00B3A6" strokeWidth="1.5" strokeLinecap="round" /></svg></div><h4>Frie fugle</h4><p>Ingen binding. Opsig når du vil — vi holder på dig med produktet, ikke en kontrakt.</p></div>
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="9" rx="4.5" stroke="#2EB7FF" strokeWidth="2" /><circle cx="16.5" cy="12.5" r="2.7" fill="#00B3A6" /></svg></div><h4>Åben og ærlig</h4><p>Ingen sælgere, ingen dyre konsulenter. Du ser præcis, hvad du får.</p></div>
            <div className="vcard reveal"><div className="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.6v5.4c0 4.3-3 7.4-7 9-4-1.6-7-4.7-7-9V5.6L12 3z" stroke="#2EB7FF" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2.2 2.2L15 9.8" stroke="#00B3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><h4>Skarp pris</h4><p>Ingen tung organisation eller fancy hovedkontor — derfor nok de billigste på det, vi gør.</p></div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="priser">
        <div className="wrap">
          <div className="center reveal">
            <span className="kick">Priser</span>
            <h2 className="big">Vælg din rækkevidde.</h2>
            <p className="lead">Gratis de første 14 dage. Opsiger du inden for prøveperioden, betaler du ikke noget. Fortsætter du, trækkes prisen for din valgte plan automatisk efter de 14 dage — og derefter hver måned. Ingen binding — skift eller stop, når du vil.</p>
          </div>
          <div className="tiers">
            <div className="tier reveal">
              <div className="bird"><svg width="22" viewBox="0 0 28 28" fill="none"><path d="M4 16C8 10 11 10 14 14" stroke="#2EB7FF" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 14C17 10 20 10 24 16" stroke="#2EB7FF" strokeWidth="2.4" strokeLinecap="round" /></svg> Birdly Spurv</div>
              <div className="desc">Til de meget lokale.</div>
              <div className="amt">349<span> kr./md</span></div>
              <div className="exm">ekskl. moms · gratis i 14 dage</div>
              <ul>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Kommunale &amp; statslige udbud i <b>én region</b>, du selv vælger</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>SMS + mail ved match</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Resumé, dato og link</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Bud-skabelon inkluderet</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Ingen binding</span></li>
              </ul>
              <Link href="/tilmeld" className="btn btn-ghost">Start gratis</Link>
            </div>

            <div className="tier feat reveal">
              <span className="tag">MEST POPULÆRE</span>
              <div className="bird"><svg width="22" viewBox="0 0 28 28" fill="none"><path d="M3 15C8 8 12 8 14 13" stroke="#00B3A6" strokeWidth="2.6" strokeLinecap="round" /><path d="M14 13C16 8 20 8 25 15" stroke="#0D1B2A" strokeWidth="2.6" strokeLinecap="round" /></svg> Birdly Falk</div>
              <div className="desc">Til de regionale.</div>
              <div className="amt">499<span> kr./md</span></div>
              <div className="exm">ekskl. moms · gratis i 14 dage</div>
              <ul>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Alt i Spurv</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Alle regioner <b>vest eller øst for Storebælt</b></span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Flere matches — større område</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Bud-skabelon inkluderet</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Ingen binding</span></li>
              </ul>
              <Link href="/tilmeld" className="btn btn-teal">Start gratis</Link>
            </div>

            <div className="tier reveal">
              <div className="bird"><svg width="22" viewBox="0 0 28 28" fill="none"><path d="M2 15C8 7 13 7 14 13" stroke="#0D1B2A" strokeWidth="2.6" strokeLinecap="round" /><path d="M14 13C15 7 20 7 26 15" stroke="#2EB7FF" strokeWidth="2.6" strokeLinecap="round" /></svg> Birdly Albatros</div>
              <div className="desc">Til de landsdækkende.</div>
              <div className="amt">1.199<span> kr./md</span></div>
              <div className="exm">ekskl. moms · gratis i 14 dage</div>
              <ul>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Alt i Falk</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Udbud i <b>hele Danmark</b></span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Det bedste overblik på markedet</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Bud-skabelon inkluderet</span></li>
                <li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Ingen binding</span></li>
              </ul>
              <Link href="/tilmeld" className="btn btn-ghost">Start gratis</Link>
            </div>
          </div>
          <p className="price-note">Alle priser er ekskl. moms. De første 14 dage er gratis — opsiger du inden da, trækkes der intet. Derefter trækkes prisen for din plan automatisk og fornyes hver måned. Opsig når du vil med 30 dages varsel.</p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="om">
        <div className="wrap">
          <div className="about-grid">
            <div className="reveal">
              <span className="kick" style={{ color: "var(--sky)" }}>Om os</span>
              <h2>Bygget af folk, der selv har siddet i den anden ende.</h2>
              <p>Gennem mange år i grossist- og produktionsleddet har vi selv mærket, hvor besværligt og tidskrævende det er at finde de udbud, der rent faktisk passer. Derfor lavede vi Birdly — det stik modsatte af en stor, støvet udbudsportal.</p>
              <p>Vi gør én ting: matcher konkrete udbud med din virksomhed og sender dig en simpel besked. Resten kan du selv.</p>
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
          <div className="faq-list">
            <details className="reveal"><summary>Skal jeg logge ind på en platform? <span className="pm">+</span></summary><p>Nej — og det er helt bevidst. Der er rigeligt med platforme i forvejen, og vi tror ikke, verden bliver hverken nemmere eller bedre af endnu én. Birdly er det stik modsatte: vi har pakket alt det tekniske væk, så du kun får én konkret besked på sms og mail, når et udbud matcher dig. Hverken mere eller mindre — ingen login, ingen dashboards, intet bøvl.</p></details>
            <details className="reveal"><summary>Får jeg kun relevante udbud? <span className="pm">+</span></summary><p>Vi sender kun besked, når en opgave matcher det, du har valgt. Vil du have flere eller færre beskeder, kan du altid ændre dine valg.</p></details>
            <details className="reveal"><summary>Hvor mange sms'er får jeg? <span className="pm">+</span></summary><p>Du får kun besked, når et helt konkret udbud matcher de kriterier, du selv har sat — fag, område og beløb. Hvor mange det bliver, afhænger derfor af, hvor mange relevante udbud der dukker op i din valgte region. Er det for meget eller for lidt, kan du altid justere dine kriterier, så de bliver bredere eller mere snævre. Og skulle du få nok, stopper du beskederne med det samme ved at svare STOP på en sms.</p></details>
            <details className="reveal"><summary>Hvor hurtigt får jeg besked? <span className="pm">+</span></summary><p>Som regel samme dag, opgaven bliver lagt op. Nogle gange fanger vi også opgaver, der er på vej.</p></details>
            <details className="reveal"><summary>Hvad koster det? <span className="pm">+</span></summary><p>De første 14 dage er gratis. Derefter overgår det til prisen for din valgte plan — fra 349 kr. om måneden (ekskl. moms) — som trækkes automatisk efter prøveperioden og fornyes hver måned. Uden binding.</p></details>
            <details className="reveal"><summary>Hvad er forskellen på pakkerne? <span className="pm">+</span></summary><p>Spurv dækker én region, du selv vælger. Falk dækker alle regioner vest eller øst for Storebælt. Albatros dækker hele Danmark.</p></details>
            <details className="reveal"><summary>Hvor kommer udbuddene fra? <span className="pm">+</span></summary><p>Et udbud er bare en opgave fra en kommune, region eller staten, som private firmaer kan byde på — fra et nyt tag på en skole til rengøring af et rådhus. Vi henter dem fra de officielle kilder: udbud.dk og EU's database TED. Offentlige udbud skal være åbne for alle — så det er helt lovligt. Vi holder også øje med de indkøb, der varsles som forhåndsmeddelelser, før de bliver til et egentligt udbud — så du kan være på forkant, allerede inden opgaven officielt er sendt i udbud.</p></details>
            <details className="reveal"><summary>Hvordan opsiger jeg? <span className="pm">+</span></summary><p>Opsigelse hos Birdly er lige så simpelt, som da du meldte dig til. Du finder opsigelsesrubrikken nederst her på siden, og i bunden af alle vores mails er der et direkte link til opsigelse. Og det bedste? Hos os er du en fri fugl — ingen binding, kun 30 dages opsigelse.</p></details>
            <details className="reveal"><summary>Kan I også hjælpe os med at byde på opgaver? <span className="pm">+</span></summary><p>Ikke endnu — men det er på radaren. Birdly er et nyt produkt på det danske marked, og vores første prioritet har været at gøre det enkelt for danske SMV'er overhovedet at finde de rigtige udbud. På sigt kigger vi ind i selve det at byde, for vi synes, hele verdenen omkring kommunale og statslige udbud er for bøvlet og kompleks. Vi tror på, at alle virksomheder skal have lige adgang til at byde på offentlige opgaver — ikke kun dem med en stor tilbudsafdeling.</p></details>
            <details className="reveal"><summary>Hvordan virker bud-skabelonen? <span className="pm">+</span></summary><p>Når vi sender dig et udbud, følger der en skabelon med, hvor vi allerede har samlet og forberedt det meste — krav, frister og de formelle ting. Med farver kan du se, hvad vi har udfyldt, og hvad der er dit. Du udfylder din pris og dine referencer og gemmer det hele som pdf.</p></details>
            <details className="reveal"><summary>Laver I tilbuddet for mig? <span className="pm">+</span></summary><p>Nej. Skabelonen er en guide og tjekliste, der gør det meste af benarbejdet klar — cirka 70 %. Din pris, dine referencer og din faglige beskrivelse er det, kun du kan udfylde. Vi giver ikke juridisk rådgivning og lover ikke, at du vinder — men vi giver dig et forspring.</p></details>
            <details className="reveal"><summary>Skal jeg selv hente udbudsmaterialet? <span className="pm">+</span></summary><p>Ja. Det fulde materiale ligger hos ordregiveren, og vi linker dig direkte derhen, så du slipper for at lede. Hos nogle ordregivere skal du oprette en gratis konto for at hente det — den skal du alligevel bruge for at aflevere dit tilbud.</p></details>
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
              <p className="lead">Udfyld få oplysninger, så holder Birdly øje for dig. Du hører fra os, så snart der er et udbud, der passer.</p>
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
              <p className="ft" style={{ marginBottom: 20 }}>Du udfylder dit fag, område og opgavestørrelse — så finder vi de mest relevante udbud til dig. Gratis i 14 dage. Ingen binding — opsig når du vil.</p>
              <Link href="/tilmeld" className="submit" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>Kom i gang →</Link>
              <p className="fnote">Ingen binding. Stop når du vil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="ctaband">
        <div className="wrap">
          <h2 className="reveal">Klar til at få udbud direkte på SMS?</h2>
          <p className="reveal">Lad Birdly holde øje, så du kan bruge tiden på det, du er god til.</p>
          <Link href="/tilmeld" className="btn btn-teal reveal">Kom i gang — gratis i 14 dage</Link>
        </div>
      </section>

      {/* CANCEL / OPSIGELSE */}
      <section className="cancel" id="opsigelse">
        <div className="wrap">
          <div className="cbox reveal">
            <h2>Bye bye, Birdly 👋</h2>
            <p className="lead">Ja — hos os er det lige så nemt at opsige, som det var at tilmelde sig. Måske endda nemmere. Skriv dine oplysninger her, så opsiger vi med 30 dages varsel.</p>
            <div className="cancel-form">
              <input id="cMail" ref={cMailRef} type="email" placeholder="Din email" />
              <input id="cTlf" type="tel" placeholder="Dit telefonnummer" />
              <button type="button" id="cGo" onClick={onCancel}>Opsig Birdly</button>
            </div>
            <p className="psst">Psst … vi håber at se dig snart igen.</p>
          </div>
        </div>
      </section>

      <Footer />

      {/* OPSIGELSES-FEEDBACK-POPUP (Trin 1 — feedback + "tjek din mail") */}
      <OpsigPopup
        open={cancelOpen}
        email={cMailRef.current?.value || ""}
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
