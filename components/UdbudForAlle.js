import Link from "next/link";
import Footer from "./Footer";
import { Logo } from "./Logo";
import "../app/udbud.css";

export default function UdbudForAlle() {
  return (
    <div className="birdly-udbud">
      <header>
        <div className="bar">
          <Logo height={32} />
          <nav className="nav">
            <a href="/#hvorfor">Hvorfor Birdly</a>
            <a href="/#hvordan">Hvordan virker det</a>
            <a href="/#priser">Priser</a>
            <a href="/#faq">FAQ</a>
            <a href="/#om">Om os</a>
            <Link href="/udbud-for-alle" className="on">Opgaver er for alle</Link>
          </nav>
          <Link href="/tilmeld" className="nav-cta">Kom i gang nu</Link>
        </div>
      </header>

      <div className="hero">
        <div className="wrap">
          <span className="ey">🐦 Vores holdning</span>
          <h1>Opgaver er for alle</h1>
          <div className="psst">— ikke kun for de store</div>
          <p>Offentlige opgaver burde ikke kun være for dem med en hel udbudsafdeling. Hos Birdly gør vi dem tilgængelige for de små og mellemstore — helt automatisk.</p>
          <div className="btns">
            <Link href="/tilmeld" className="btn btn-teal">Kom i gang nu</Link>
            <a href="/#hvordan" className="btn btn-ghost">Se hvordan det virker</a>
          </div>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="lead">Hvorfor går så mange glip af det?</div>
          <p className="body">Sandheden er enkel. Der er masser af offentlige og statslige opgaver — men de er spredt ud, tunge at læse og tidskrævende at holde øje med. For en lille eller mellemstor virksomhed med en presset hverdag er der sjældent timer tilovers til at grave sig gennem portaler dag efter dag.</p>
          <p className="body">Og når man endelig opdager den rigtige opgave, er fristen ofte løbet fra én. Så lader man være. <b>Ikke fordi man ikke kunne vinde — men fordi man aldrig nåede at byde.</b></p>
        </div>
      </section>

      <section style={{ background: "var(--grey)" }}>
        <div className="wrap">
          <div className="lead">Det har vi gjort fuldstændig automatisk</div>
          <p className="body">Du tilmelder dig én gang med dine firmaoplysninger og præferencer. Så holder vi øje — hver dag, hele tiden. Hver gang der dukker en opgave op, der passer til jer, hører du fra os:</p>
          <ul className="list">
            <li><svg viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="11" fill="#00B3A6" /><path d="M7 12.5l3 3 7-7.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> En <b>SMS</b> med det samme, hvis du ønsker det — så du er blandt de første, der ved det.</li>
            <li><svg viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="11" fill="#00B3A6" /><path d="M7 12.5l3 3 7-7.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> En <b>mail</b> med et kort resumé af opgaven, fristen og et direkte link til udbuddet.</li>
            <li><svg viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="11" fill="#00B3A6" /><path d="M7 12.5l3 3 7-7.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> En <b>skabelon</b> til selve buddet, hvor det meste allerede står klar — du udfylder bare resten.</li>
          </ul>
          <p className="body" style={{ marginTop: 20 }}>Så kan I tage den derfra internt. <b>Ingen platform at logge ind på. Ingen daglig søgning. Ingen spildte aftener.</b></p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="lead">Brug krudtet på det, der faktisk tæller</div>
          <p className="body">Når overvågningen er ude af jeres hænder, kan I lægge energien dér, hvor den gør en forskel: at skære jeres tilbud til, beskrive jeres ydelser skarpt og samle de rette referencer.</p>
          <p className="body">Det er dét, der vinder opgaver — ikke at sidde og scrolle i endeløse udbudslister.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="band">
            <h2>Alle fortjener en fair chance</h2>
            <p>Vi tror på, at størrelsen på din virksomhed ikke skal afgøre, om du overhovedet får øje på opgaven. En fair chance starter med at være forrest i feltet, når opgaverne bliver offentliggjort. Det er hele idéen bag Birdly.</p>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--grey)" }}>
        <div className="wrap">
          <div className="lead">Vi fanger også opgaverne tidligt</div>
          <p className="body">Nogle af de bedste muligheder begynder som et <b>forventet indkøb</b> eller en varslet opgave — før der ligger et færdigt udbud. Vi tager også dem med, så I kan være klar og forberedte, mens andre stadig venter på, at opgaven officielt bliver slået op.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="lead">Anderledes — og med vilje</div>
          <p className="body">De fleste løsninger på markedet er bygget som store platforme: log ind, lær systemet, betal for moduler, vent på en sælger. Det er bevidst ikke os. Birdly er det modsatte — kvikt, konkret og til at gå til.</p>
          <div className="compare">
            <div className="col them">
              <h3>Sådan plejer det at være</h3>
              <ul>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="none" stroke="#B4BCC8" strokeWidth="1.6" /><path d="M7 7l6 6M13 7l-6 6" stroke="#B4BCC8" strokeWidth="1.6" strokeLinecap="round" /></svg> Tungt, teknisk og tidskrævende</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="none" stroke="#B4BCC8" strokeWidth="1.6" /><path d="M7 7l6 6M13 7l-6 6" stroke="#B4BCC8" strokeWidth="1.6" strokeLinecap="round" /></svg> Endeløse lister at lede i</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="none" stroke="#B4BCC8" strokeWidth="1.6" /><path d="M7 7l6 6M13 7l-6 6" stroke="#B4BCC8" strokeWidth="1.6" strokeLinecap="round" /></svg> Sælgere, moduler og binding</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="none" stroke="#B4BCC8" strokeWidth="1.6" /><path d="M7 7l6 6M13 7l-6 6" stroke="#B4BCC8" strokeWidth="1.6" strokeLinecap="round" /></svg> Dyre konsulenttimer</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="none" stroke="#B4BCC8" strokeWidth="1.6" /><path d="M7 7l6 6M13 7l-6 6" stroke="#B4BCC8" strokeWidth="1.6" strokeLinecap="round" /></svg> En portal du skal logge ind på og lære at kende</li>
              </ul>
            </div>
            <div className="col us">
              <h3>Sådan gør Birdly</h3>
              <ul>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Enkelt og konkret — bare en SMS og en mail</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Kun de match, der passer til jer</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Ingen sælgere, ingen binding</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Fast, lav pris — opsig når du vil</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#00B3A6" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> En åben skabelon til buddet — uden login</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SKABELON — Sådan virker skabelonen (kompakt: tekst venstre, udsnit m. 3 farve-tilstande højre) */}
      <section className="skabsec">
        <div className="wrap">
          <div className="sk-grid">
            <div className="sk-copy">
              <span className="sk-label">Sådan virker skabelonen</span>
              <div className="lead">Et udkast, der er det meste af vejen klar</div>
              <p className="body">Sammen med dit udbudsmatch får du en skabelon, hvor vi allerede har forberedt det meste — krav, frister og det formelle. Med farver kan du altid se, hvad vi har udfyldt, og hvad der er dit.</p>
              <ul className="sk-checks">
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Det formelle er sat op for dig</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Vi siger ærligt, hvad du selv skal tjekke</li>
                <li><svg viewBox="0 0 20 20" width="18"><circle cx="10" cy="10" r="9" fill="#E6FFFB" /><path d="M6 10.5l2.5 2.5L14 7" stroke="#00B3A6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> Gem som pdf, klar til at aflevere</li>
              </ul>
              <p className="sk-honest">Vi gør cirka 70 % klar. De sidste 30 % — din pris, dine referencer og det faglige — er dit. Vi laver ikke dit udbud for dig.</p>
            </div>
            <div className="sk-card">
              <div className="sk-cardh">Bud-skabelon · uddrag</div>
              <div className="sk-row green">
                <span className="sk-tag">🟢 Udfyldt af Birdly</span>
                <span className="sk-val">Frist: 14. august 2026 · ESPD påkrævet · Sjælland</span>
              </div>
              <div className="sk-row amber">
                <span className="sk-tag">🟡 Tjek i materialet</span>
                <span className="sk-val">Tekniske mindstekrav</span>
                <span className="sk-note">Står i materialet hos ordregiveren</span>
              </div>
              <div className="sk-row blue">
                <span className="sk-tag">🔵 Udfyld selv</span>
                <span className="sk-val">Din pris &amp; dine referencer</span>
                <div className="sk-field">Skriv din pris her …</div>
              </div>
              <div className="sk-legend">
                <span><i className="dot green"></i> Vi har udfyldt</span>
                <span><i className="dot amber"></i> Tjek i materialet</span>
                <span><i className="dot blue"></i> Du udfylder selv</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <h2>Giv din virksomhed en fair chance</h2>
          <p>Tilmeld dig på to minutter, og lad os holde øje med udbuddene — så du kan bruge tiden på at vinde dem.</p>
          <Link href="/tilmeld" className="btn btn-teal">Kom i gang nu</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
