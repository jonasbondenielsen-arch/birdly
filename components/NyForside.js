import Link from "next/link";
import { Logo } from "./Logo";
import Footer from "./Footer";
import { daTal } from "../lib/opgaveTal";
import { priceText, YEARLY_SAVING, TRIAL_DAYS } from "../lib/pakke";
import "../app/ny.css";

// ============================================================================
// /ny — resultat-først forside.
//
// ⚠️ ERSTATTER IKKE `/`. Forsiden bærer hele SEO-laget og alle indgående links;
// den her kører ved siden af og er noindex, indtil den har vist sig bedre. Så
// flyttes den ind. Samme rækkefølge som /start ved siden af /tilmeld.
//
// ⚠️ ALLE TAL ER ÆGTE. De kommer fra get-opgave-tal, som tæller i basen. Er der
// intet tal, renderer boksen ikke — et gæt eller et nul på forsiden er værre end
// ingen boks. Se `tal`-checket nedenfor.
//
// ⚠️ INGEN TAL PÅ FAG-KORTENE. Besluttet: kortene er indgange, ikke bevis. Et
// "Catering — 1 opgave" på forsiden sælger værre end ingenting, og tallet svinger
// med ugen. Tallet hører hjemme i /start's trin 3, hvor det er personligt og hvor
// 0-tilstanden har en ærlig formulering.
// ============================================================================

// Fag-kortene. Nøglerne SKAL findes i fag_cpv_map — de sendes videre som
// ?fag=<key> og forvælger faget i onboardingen. Teksten under er hverdagssprog,
// ikke CPV-jargon: kunden skal genkende sit eget arbejde på et halvt sekund.
const FAG_KORT = [
  { key: "entreprenor", navn: "Entreprenør", under: "anlæg, jord, beton" },
  { key: "vvs", navn: "VVS", under: "varme, sanitet, ventilation" },
  { key: "elektriker", navn: "Elektriker", under: "installation, tavler" },
  { key: "tomrer", navn: "Tømrer", under: "tag, facade, indretning" },
  { key: "murer", navn: "Murer", under: "mur, puds, flise" },
  { key: "maler", navn: "Maler", under: "ind- og udvendig" },
  { key: "kloak", navn: "Kloak", under: "separering, TV-inspektion" },
  { key: "rengoring", navn: "Rengøring", under: "fast og periodisk" },
];

const TRIN = [
  { n: 1, t: "Du fortæller hvad I laver", b: "Fag og område. Det tager under et minut." },
  { n: 2, t: "Vi holder øje — hver dag", b: "Alle offentlige opgaver i Danmark, to gange dagligt." },
  { n: 3, t: "Du får en besked", b: "SMS og mail, så snart der er en opgave der passer til jer." },
];

function fmtTid(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

export default function NyForside({ tal }) {
  // Har vi ikke tal, vises live-boksen slet ikke. Resten af siden står fint uden.
  const harTal = typeof tal?.bydbare_aabne === "number" && tal.bydbare_aabne > 0;
  const seneste = Array.isArray(tal?.seneste) ? tal.seneste.filter((n) => n?.titel) : [];

  return (
    <div className="ny">
      <header className="ny-top">
        <div className="ny-wrap ny-bar">
          <Logo height={32} />
          <Link href="/start" className="ny-navcta">Kom i gang nu</Link>
        </div>
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="ny-hero">
        <div className="ny-wrap ny-herogrid">
          <div>
            <span className="ny-pill">🐦 Gratis i {TRIAL_DAYS} dage — ingen binding</span>
            <h1>Birdly arbejder allerede.<br />Du får besked på SMS.</h1>
            <p className="ny-sub">
              Vi holder øje med alle offentlige opgaver i Danmark. Passer en til dit fag,
              får du en besked. Du skal ikke lede efter noget.
            </p>
            <div className="ny-cta">
              <Link href="/start" className="ny-btn ny-btn-teal">Kom i gang nu</Link>
              <a href="#saadan" className="ny-btn ny-btn-ghost">Se hvordan det virker</a>
            </div>

            {/* Matchgarantien står ved CTA'en, hvor tvivlen er. "Birdly virker" først —
                selvtillid før garanti. */}
            <div className="ny-garanti">
              <b>Birdly virker. Derfor giver vi matchgaranti.</b>
              <p>Finder vi ikke et match til dig, koster det dig ikke en krone. Så enkelt er det.</p>
            </div>
          </div>

          {harTal && (
            <aside className="ny-live" aria-label="Live-overblik">
              <div className="ny-live-h"><span className="ny-prik" aria-hidden="true" /> Live · opdateres 2× dagligt</div>
              <div className="ny-bigtal">{daTal(tal.bydbare_aabne)}</div>
              <small>opgaver med åben frist lige nu</small>

              <div className="ny-tiles">
                {typeof tal.nye_7_dage === "number" && (
                  <div className="ny-tile"><b>{daTal(tal.nye_7_dage)}</b><span>nye de sidste 7 dage</span></div>
                )}
                <div className="ny-tile"><b>2×</b><span>opdatering dagligt</span></div>
              </div>

              {/* ⚠️ ÆGTE OFFENTLIGE UDBUD — aldrig opdigtede hændelser. Med tre kunder
                  ville "Anders fra Aarhus fik et match" desuden være identificerbart. */}
              {seneste.length > 0 && (
                <>
                  <ul className="ny-feed">
                    {seneste.map((n, i) => (
                      <li key={i}>
                        <span className="ny-feed-t">{n.titel}</span>
                        {n.koeber && <em>{n.koeber}</em>}
                      </li>
                    ))}
                  </ul>
                  <small className="ny-feed-note">
                    Seneste opgaver hentet fra TED og Udbud.dk
                    {fmtTid(seneste[0]?.hentet) ? ` · ${fmtTid(seneste[0].hentet)}` : ""}
                  </small>
                </>
              )}
            </aside>
          )}
        </div>
      </section>

      {/* ---------------- FAG-KORT ---------------- */}
      <section className="ny-sek">
        <div className="ny-wrap">
          <span className="ny-kick">Vælg din branche</span>
          <h2 className="ny-big">Hvad laver I?</h2>
          <p className="ny-lead">Klik dit fag. Så viser vi hvad vi finder til jer — og du er allerede i gang.</p>
          <div className="ny-fagg">
            {FAG_KORT.map((f) => (
              <Link key={f.key} href={`/start?fag=${f.key}`} className="ny-fagk">
                <b>{f.navn}</b>
                <span>{f.under}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- UDEN / MED ---------------- */}
      <section className="ny-sek ny-graa">
        <div className="ny-wrap">
          <span className="ny-kick">Forskellen</span>
          <h2 className="ny-big">Uden Birdly — og med</h2>
          <div className="ny-cmp">
            <div>
              <h3>Uden Birdly</h3>
              <ul>
                <li><span className="ny-x">✕</span> Du leder selv på flere portaler</li>
                <li><span className="ny-x">✕</span> Du opdager opgaven for sent</li>
                <li><span className="ny-x">✕</span> Du bruger aftener på at lede</li>
                <li><span className="ny-x">✕</span> Du ved ikke hvad du gik glip af</li>
              </ul>
            </div>
            <div className="ny-ok">
              <h3>Med Birdly</h3>
              <ul>
                <li><span className="ny-v">✓</span> Vi holder øje — hele tiden</li>
                <li><span className="ny-v">✓</span> Du får en SMS når noget passer</li>
                <li><span className="ny-v">✓</span> Alt samlet på din egen side</li>
                <li><span className="ny-v">✓</span> Du bruger tiden på at byde</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SÅDAN VIRKER DET ---------------- */}
      <section className="ny-sek" id="saadan">
        <div className="ny-wrap">
          <span className="ny-kick">Sådan virker det</span>
          <h2 className="ny-big">Tre skridt. Så kører det.</h2>
          <div className="ny-trin">
            {TRIN.map((t) => (
              <div className="ny-trinkort" key={t.n}>
                <div className="ny-nr">{t.n}</div>
                <b>{t.t}</b>
                <p>{t.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRIS ---------------- */}
      <section className="ny-sek ny-graa">
        <div className="ny-wrap">
          <span className="ny-kick">Pris</span>
          <h2 className="ny-big">Én pris. Ingen binding.</h2>
          {/* ⚠️ Beløbene kommer fra lib/pakke.js — hardkod dem ALDRIG her. Det var
              netop tre hardkodede steder der stod med den gamle pris efter en
              ændring (CLAUDE.md, "Pris — REGLERNE"). */}
          <div className="ny-pris">
            <div className="ny-priskort">
              <span className="ny-prisnavn">Måned</span>
              <b>{priceText.monthly}</b>
              <small>ekskl. moms</small>
              <Link href="/start" className="ny-btn ny-btn-ghost ny-bred">Kom i gang nu</Link>
            </div>
            <div className="ny-priskort ny-fremhaev">
              <span className="ny-prisnavn">År <i>{priceText.saveShort}</i></span>
              <b>{priceText.yearly}</b>
              <small>ekskl. moms · {YEARLY_SAVING.amount.toLocaleString("da-DK")} kr. sparet</small>
              <Link href="/start" className="ny-btn ny-btn-teal ny-bred">Kom i gang nu</Link>
            </div>
          </div>
          <p className="ny-note">Gratis de første {TRIAL_DAYS} dage · ingen binding · sig op når som helst</p>
        </div>
      </section>

      {/* ---------------- AFSLUTTENDE CTA ---------------- */}
      <section className="ny-band">
        <div className="ny-wrap">
          <h2>Klar til at fange din næste opgave?</h2>
          <p>Fortæl os hvad I laver. Så holder vi øje for jer.</p>
          <Link href="/start" className="ny-btn ny-btn-hvid">Kom i gang nu</Link>
          <p className="ny-band-garanti">Matchgaranti: Får du ingen match, betaler du ikke en krone.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
