import Link from "next/link";
import Footer from "./Footer";
import { Logo } from "./Logo";
import StickyCta from "./StickyCta";
import OpgaveTaeller from "./OpgaveTaeller";
import OpretOpgaveCta from "./OpretOpgaveCta";
import { OPRET_OPGAVE_I_NAV } from "../lib/opretOpgave";
import { regionerForFag } from "../lib/regioner";
import { daTal } from "../lib/opgaveTal";
import "../app/forside.css";

// Branche-landingsside (SEO). Server-renderet — alt indhold er i HTML ved load.
// Genbruger forsidens design (.birdly-home + forside.css): samme header, hero,
// kort (.vals/.vcard), FAQ (.faq-list/details) og CTA-bånd (.ctaband). Ingen nyt
// designsprog. Data kommer fra lib/branche.js.

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="10" fill="#00B3A6" />
    <path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HouseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 20V8l8-5 8 5v12" stroke="#2EB7FF" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 20v-6h6v6" stroke="#2EB7FF" strokeWidth="1.8" />
  </svg>
);

// `region` er valgfri. Uden den er siden præcis som før (de 20 fag-sider); med den
// bliver det en fag×geo-side — SAMME komponent, samme klasser, samme design. Det er
// bevidst ikke en ny sidetype: to skabeloner for det samme ville drive fra hinanden,
// og så ville halvdelen af siderne stille og roligt holde op med at ligne Birdly.
export default function BrancheSide({ data, region = null, opgaveTal = null }) {
  const { slug, nounPlural, nounSingular, fagKey, arbejde, ex1, ex2, kortSvarExtra, whyHeading, whyText, eksemplerIntro, examples, faq, privatRelevans, privatLinje } = data;

  // ⚠️ ÆRLIGHEDSREGEL, IKKE EN STILVARIANT (Jonas 24-08-2026). Private opgaver må kun
  // loves dér hvor de reelt kommer. En tømrer får private opgaver hver uge; et
  // IT-firma eller en revisor gør ikke, og en side der lover dem sælger noget vi ikke
  // kan levere — og det opdager kunden allerede i sin første måned.
  //
  // Klassificeringen står som et felt PR. BRANCHE i lib/branche.js, ikke som en
  // liste her: så er det ét sted at rette den dag et fag flytter gruppe.
  const harPrivate = privatRelevans === "hoej";
  // Funnelen forstår allerede ?fag=; ?region= er tilføjet efter samme mønster, så
  // kunden lander med både fag og område forvalgt og har færre klik tilbage.
  const funnel = "/kom-i-gang?fag=" + fagKey + (region ? "&region=" + region.slug : "");
  const sted = region ? ` ${region.praep} ${region.navn}` : "";
  // Søskende-regioner: på en fag×geo-side vises de ANDRE regioner, på en ren fag-side
  // vises alle. Det er dét der binder siderne sammen som struktur frem for løse URL'er.
  const andreRegioner = regionerForFag(slug).filter((r) => !region || r.slug !== region.slug);

  // Regionsspecifikke spørgsmål lægges TIL fagets egne — ikke i stedet for. Så er hver
  // side unik uden at fagets gode svar går tabt.
  const faqAlle = region
    ? [
        ...faq,
        {
          q: `Er der nok opgaver ${region.praep} ${region.navn}?`,
          a: `${region.naerhed} Du får kun besked, når en opgave rent faktisk passer til dit fag og dit område — så du mærker ikke forskel på travle og stille uger, ud over hvor mange beskeder der kommer.`,
        },
        {
          q: `Dækker I hele ${region.navn}?`,
          a: `Ja. Vi holder øje med ${region.kommuner}. Du vælger selv, om du kun vil have opgaver herfra, eller om du også vil se opgaver i nabo­regionerne.`,
        },
      ]
    : faq;

  // Ren FAQ-structured-data (FAQPage) til Google.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqAlle.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="birdly-home har-sticky-cta">
      {/* HEADER — samme som forsiden */}
      <header>
        <div className={"wrap bar" + (OPRET_OPGAVE_I_NAV ? " bar-2cta" : "")}>
          <Logo height={32} />
          <nav className="menu">
            <a href="/#hvorfor">Hvorfor Birdly</a>
            <a href="/#hvordan">Hvordan virker det</a>
            <a href="/#priser">Priser</a>
            <a href="/#faq">FAQ</a>
            <Link href="/brancher">Brancher</Link>
          </nav>
          <div className="right">
            <Link href={funnel} className="nav-cta">Find opgaver nu</Link>
            <OpretOpgaveCta />
          </div>
        </div>
        {/* Tælleren står allerede på fagets eget tal — derfor ingen branchevælger her;
            den ville kunne føre den besøgende væk fra den side hun lige er landet på. */}
        <OpgaveTaeller tal={opgaveTal} />
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap center" style={{ position: "relative", zIndex: 2 }}>
          <span className="pill">🐦 Gratis i 14 dage — ingen binding</span>
          <h1>
            {harPrivate ? "Opgaver for " : "Relevante opgaver til "}{nounPlural}{sted}
            <br />— direkte på <span className="sky-em">SMS</span>
          </h1>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            {/* Samme sætning, to sandheder: fag med private opgaver får dem nævnt,
                de øvrige får den rene offentlige formulering. Se harPrivate ovenfor. */}
            {harPrivate
              ? (region
                  ? `Birdly finder relevante offentlige og private opgaver til ${nounPlural} ${region.praep} ${region.navn} — og sender dig besked, når der er et match.`
                  : `Birdly finder relevante offentlige og private opgaver til ${nounPlural} og sender dig besked, når der er et match.`)
              : (region
                  ? `Kommunerne ${region.praep} ${region.navn} har hele tiden opgaver til ${nounPlural}. Birdly holder øje med dem alle sammen og sender dig en SMS, når der er en, der passer til dit firma.`
                  : `Kommuner, regioner og staten har hele tiden opgaver til ${nounPlural}. Birdly finder dem, der passer til dit firma, og sender dig en SMS, når der er et match.`)}
          </p>
          <div className="checks" style={{ justifyContent: "center" }}>
            <span><Check /> Kun opgaver, der passer til dig</span>
            <span><Check /> Direkte på SMS og mail</span>
          </div>
          <div className="cta" style={{ justifyContent: "center" }}>
            <Link href={funnel} className="btn btn-teal">Find opgaver nu</Link>
          </div>
        </div>
      </section>

      {/* DET KORTE SVAR */}
      <section>
        <div className="wrap center" style={{ maxWidth: 820 }}>
          <span className="kick">Det korte svar</span>
          <h2 className="big">{harPrivate ? "Ja — også opgaver dit firma kan byde på." : "Ja — også dit firma kan byde."}</h2>
          <p className="lead">
            Det offentlige køber hele tiden {arbejde} hos private firmaer — fra {ex1} til {ex2}. Du behøver ikke være stor. Du skal bare kunne se opgaverne i tide — og det er præcis det, Birdly hjælper med.{kortSvarExtra ? " " + kortSvarExtra : ""}
          </p>
          {/* Kun hvor der faktisk kommer private opgaver. Sætningen står pr. branche
              i lib/branche.js, så eksemplerne er fagets egne og ikke generiske. */}
          {harPrivate && privatLinje && (
            <p className="lead" style={{ marginTop: 14 }}>
              <b>{privatLinje}</b> Birdly holder øje og sender dig de opgaver, der passer til dit firma.
            </p>
          )}
        </div>
      </section>

      {/* HVORFOR OFFENTLIGE OPGAVER */}
      <section>
        <div className="wrap center" style={{ maxWidth: 820 }}>
          <span className="kick">Hvorfor det er værd at kigge</span>
          <h2 className="big">{whyHeading}</h2>
          <p className="lead">{whyText}</p>
          {harPrivate && (
            <p className="lead" style={{ marginTop: 14 }}>
              Du vælger selv område og type opgave. Birdly finder mulighederne og sender dig besked.
            </p>
          )}
          <div className="cta" style={{ justifyContent: "center", marginTop: 22 }}>
            <Link href={funnel} className="btn btn-teal">Find opgaver nu</Link>
          </div>
        </div>
      </section>

      {/* SÅDAN BYDER DU — kun på fag×geo-siderne. Det er den sektion der gør siden
          konkret for netop dét område frem for en fag-side med et stednavn klistret på. */}
      {region && (
        <section>
          <div className="wrap center" style={{ maxWidth: 820 }}>
            <span className="kick">Sådan gør du</span>
            <h2 className="big">Sådan byder du på {arbejde} {region.praep} {region.navn}</h2>
            {/* ⚠️ IKKE et branchetal. Sætningen sagde før "X opgaver for tømrere i
                Nordjylland" — ærligt, men et dårligt salgsargument: i en stille uge
                står der 1 eller 0, og så ligner produktet dødt. Nu står hele
                beholdningen, og sætningen lover udtrykkeligt IKKE at de alle passer
                til netop dette fag og område — det er dét filtreringen er til for. */}
            {/* ⚠️ SAMME FELT SOM BAREN OG SALGSSIDEN (03-08-2026): bydbare.
                Linjen læste `bydbare` rundet ned ("over 400"), mens baren øverst på
                SAMME side viste 338. To tal på én skærm inviterer spørgsmålet om
                hvilket der passer — og det ene talte opgaver hvis frist var udløbet.
                Præcist tal, ingen afrunding: der står ovenfor hvornår det blev hentet. */}
            {opgaveTal?.bydbare != null && (
              <p className="lead" style={{ fontWeight: 600 }}>
                Lige nu holder vi øje med <b>{daTal(opgaveTal.bydbare)} offentlige opgaver</b> i
                hele landet. Du får kun besked om dem, der passer til dit fag og dit område.
              </p>
            )}
            <p className="lead">
              Opgaverne bliver lagt op af de enkelte kommuner — {region.kommuner}. De ligger spredt på
              forskellige portaler, og de fleste af dem passer ikke til dig. Du fortæller os, hvad du
              laver, og hvor du kører hen. Så holder vi øje med dem alle sammen og sender dig en SMS,
              når der er en opgave, der passer. Derfra byder du, som du plejer — vi blander os ikke i
              dit tilbud, vi sørger bare for, at du ser opgaven mens der stadig er tid.
            </p>
          </div>
        </section>
      )}

      {/* EKSEMPLER */}
      <section className="examples">
        <div className="wrap center">
          <span className="kick">Eksempler</span>
          <h2 className="big">Sådan kan opgaverne se ud</h2>
          {eksemplerIntro && <p className="lead">{eksemplerIntro}</p>}
        </div>
        <div className="wrap">
          <div className="vals">
            {examples.map((e) => (
              <div className="vcard" key={e.title}>
                <div className="ic"><HouseIcon /></div>
                <h4>{e.title}</h4>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap center">
          <span className="kick">FAQ</span>
          <h2 className="big">Godt at vide</h2>
        </div>
        <div className="faq-list">
          {faqAlle.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span className="pm">+</span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* REGIONER — binder fag-siden og dens fag×geo-varianter sammen, så de nye sider
          er en del af strukturen og ikke løse URL'er Google skal snuble over. */}
      {andreRegioner.length > 0 && (
        <section>
          <div className="wrap center" style={{ maxWidth: 820 }}>
            <span className="kick">Områder</span>
            <h2 className="big">{region ? "Se også andre områder" : "Se opgaver i dit område"}</h2>
            <div className="cta" style={{ justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
              {andreRegioner.map((r) => (
                <Link key={r.slug} href={`/fag/${slug}/${r.slug}`} className="btn btn-ghost">
                  {nounSingular.charAt(0).toUpperCase() + nounSingular.slice(1)}­opgaver {r.praep} {r.navn}
                </Link>
              ))}
              {region && (
                <Link href={`/fag/${slug}`} className="btn btn-ghost">Hele landet</Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AFSLUTTENDE CTA */}
      <section className="ctaband">
        <div className="wrap">
          <h2>Klar til at fange din næste opgave?</h2>
          <p>Gratis i 14 dage, ingen binding. Du kan altid ændre dine valg eller stoppe igen.</p>
          <Link href={funnel} className="btn btn-teal">Find opgaver nu</Link>
        </div>
      </section>

      <Footer />

      {/* Sticky CTA sidst i træet, så den ligger over alt uden at kræve z-index-kamp
          med sektionerne. Plads i bunden gives af .har-sticky-cta i forside.css. */}
      <StickyCta
        href={funnel}
        tekst={region ? `Opgaver for ${nounPlural} ${region.praep} ${region.navn}` : `Opgaver for ${nounPlural} — direkte på SMS`}
      />

      {/* FAQ structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </div>
  );
}
