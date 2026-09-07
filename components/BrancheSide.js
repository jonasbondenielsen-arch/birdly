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
import "../app/salg.css";
import { RisikoFjernet, ProblemPris, Loesningen } from "./salg/Sektioner";
import FagBevis from "./salg/FagBevis";
import { Vaerdi } from "./salg/VaerdiSektion";
import { TRUST } from "../lib/salgTekst";
// Guide-kortene genbruger /viden-stilen frem for en kopi.
import { KLARE_GUIDES } from "../lib/viden";
import "../app/viden/viden.css";

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

  // De guides der peger paa netop denne branche. Relationen staar i lib/viden.js,
  // saa den redigeres ét sted sammen med guiden selv. Kun publicerede taeller.
  const guides = KLARE_GUIDES.filter((g) => (g.brancher || []).includes(slug)).slice(0, 3);
  // Funnelen forstår allerede ?fag=; ?region= er tilføjet efter samme mønster, så
  // kunden lander med både fag og område forvalgt og har færre klik tilbage.
  const funnel = "/kom-i-gang?fag=" + fagKey + (region ? "&region=" + region.slug : "");
  const sted = region ? ` ${region.praep} ${region.navn}` : "";
  // Søskende-regioner: på en fag×geo-side vises de ANDRE regioner, på en ren fag-side
  // vises alle. Det er dét der binder siderne sammen som struktur frem for løse URL'er.
  const andreRegioner = regionerForFag(slug).filter((r) => !region || r.slug !== region.slug);

  // Regionsspecifikke spørgsmål lægges TIL fagets egne — ikke i stedet for. Så er hver
  // side unik uden at fagets gode svar går tabt.
  // ⚠️ TO FAELLES SPOERGSMAAL PAA ALLE BRANCHESIDER (Jonas 25-08-2026), ordret.
  // De besvarer praecis de to ting en virksomhed spoerger om paa en fag-side, og
  // de hoerer hjemme HER frem for som en ny URL pr. fag - se noten om ét svar,
  // mange spoergsmaal i lib/viden.js.
  //
  // ⚠️ SPOERGSMAALET OM PRIVATE OPGAVER VISES KUN VED HOEJ PRIVAT RELEVANS. Svaret
  // er "Ja, Birdly kan ogsaa sende private [fag]-opgaver" - og paa en IT- eller
  // revisor-side ville det love praecis det, aerlighedsreglen (privatRelevans)
  // blev indfoert for at undgaa. Det ville ogsaa staa i FAQPage-schemaet og
  // dermed vaere det, en answer engine citerede om os.
  const faellesFaq = [
    {
      q: `Kan et lille ${nounSingular}-firma byde på offentlige opgaver?`,
      a: `Ja. Et lille ${nounSingular}-firma kan byde på offentlige opgaver, hvis virksomheden opfylder kravene i den konkrete opgave. Det afgørende er ikke virksomhedens størrelse alene, men om den kan levere det efterspurgte og opfylde kravene.`,
    },
    ...(harPrivate
      ? [{
          q: `Finder Birdly private ${nounSingular}-opgaver?`,
          a: `Ja. Birdly kan også sende private ${nounSingular}-opgaver, som privatpersoner eller virksomheder opretter direkte. Du vælger selv, om du ønsker både private og offentlige opgaver eller kun offentlige.`,
        }]
      : []),
  ];

  const faqAlle = region
    ? [
        ...faq,
        ...faellesFaq,
        {
          q: `Er der nok opgaver ${region.praep} ${region.navn}?`,
          a: `${region.naerhed} Du får kun besked, når en opgave rent faktisk passer til dit fag og dit område — så du mærker ikke forskel på travle og stille uger, ud over hvor mange beskeder der kommer.`,
        },
        {
          q: `Dækker I hele ${region.navn}?`,
          a: `Ja. Vi holder øje med ${region.kommuner}. Du vælger selv, om du kun vil have opgaver herfra, eller om du også vil se opgaver i nabo­regionerne.`,
        },
      ]
    : [...faq, ...faellesFaq];

  // Ren FAQ-structured-data (FAQPage) til Google.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqAlle.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    /* ⚠️ `sg` LIGGER OVENPÅ .birdly-home, ikke i stedet for. Siden beholder hele
       sit eksisterende design (header, .vals, .faq-list, .ctaband, sticky-CTA);
       `sg` giver den kun adgang til de to delte salgs-sektioner nedenfor, så
       fag-siderne siger præcis det samme om risiko og værdi som forsiden og
       /kom-i-gang. To sæt formuleringer på 36 sider ville drive fra hinanden
       inden for et halvt år. */
    <div className="birdly-home har-sticky-cta sg">
      {/* HEADER — samme som forsiden */}
      <header>
        <div className={"wrap bar" + (OPRET_OPGAVE_I_NAV ? " bar-2cta" : "")}>
          <Logo height={32} />
          {/* ⚠️ RIGTIGE RUTER, IKKE ANKRE PÅ RODEN. Punkterne pegede på /#priser
              og /#hvorfor — altså tilbage til forsiden og ned til et afsnit. Nu
              findes siderne selv, og "Viden" er kommet med: de ni guides lå i
              sitemap'et uden et eneste link fra nogen menu. */}
          <nav className="menu">
            <Link href="/sadan-virker-det">Sådan virker det</Link>
            <Link href="/brancher">Brancher</Link>
            <Link href="/priser">Priser</Link>
            <Link href="/hvorfor-birdly">Hvorfor Birdly</Link>
            <Link href="/viden">Viden</Link>
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
          {/* ⚠️ RESULTAT FØRST — MEN SØGEORDET BLIVER STÅENDE. "opgaver til
              tømrere i Nordjylland" er præcis den streng siden rangerer på, og den
              står stadig i H1. Det eneste der er byttet om, er at sætningen nu
              begynder med hvad kunden FÅR frem for med et substantiv. "Direkte
              på SMS" er flyttet fra H1 til underteksten og title'en, hvor den
              stadig tæller — den solgte ikke, den beskrev. */}
          <h1>
            Få flere opgaver til {nounPlural}{sted}.
            <br /><span className="sky-em">Uden selv at lede.</span>
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
          {/* Trust-rækken fra lib/salgTekst.js — samme fire punkter som forsiden
              og funnelen. ⚠️ "Matchgaranti" står som ét ord her; selve løftet med
              sit forbehold står i <RisikoFjernet> lige nedenfor, aldrig som en
              bar påstand i en punktliste. */}
          <ul className="sg-trust" style={{ justifyContent: "center" }}>
            {TRUST.map((t) => (
              <li key={t}><Check /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* RISIKOEN FJERNES MED DET SAMME — samme sektion, samme betingede
          garanti-ordlyd som på forsiden og /kom-i-gang. */}
      <RisikoFjernet funnelHref={funnel} />

      {/* ⚠️ ÆGTE BEVIS I NETOP DETTE FAG, og det er hele forskellen på en
          SEO-side og en konverteringsside. Tallet og opgaverne kommer fra
          preview-kandidater med fagets egne koder — samme matchmotor kunden
          bagefter matches på. Fanerne er skjult: siden ER allerede svaret på
          "hvilket fag", og faner ville invitere hende væk fra den. */}
      <FagBevis funnelHref={funnel} laastFag={fagKey} />

      {/* Hvad problemet kan koste — regnet på DETTE fag, ikke på rengøring. */}
      <ProblemPris fag={fagKey} />

      <Loesningen funnelHref={funnel} />

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

      {/* ⚠️ BRANCHESIDEN ER EN PRODUKTSIDE, IKKE EN ARTIKEL. Den svarer kort paa
          "kan mit fag byde?" og sender den der vil vide mere videre til den guide
          der faktisk svarer — frem for et afsnit paa 2.000 ord der konkurrerer med
          guiden om den samme soegning.

          ⚠️ KUN PUBLICEREDE GUIDES. Er ingen klar, staar sektionen der slet ikke:
          et link til en tom side er vaerre end intet link. */}
      {guides.length > 0 && (
        <section>
          <div className="wrap" style={{ maxWidth: 900 }}>
            <div className="center">
              <span className="kick">Godt at vide</span>
              <h2 className="big">Spørgsmål mange stiller</h2>
            </div>
            <div className="viden-grid" style={{ marginTop: 18 }}>
              {guides.map((g) => (
                <Link href={`/viden/${g.slug}`} className="viden-kort" key={g.slug}>
                  <h3>{g.h1}</h3>
                  <span className="viden-mere">Læs svaret &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* ⚠️ DEN ANDEN LÆSER. Branchesiden er skrevet til en VIRKSOMHED, men den
          rangerer på "tømreropgaver" — og nogle af dem der søger sådan, er
          privatpersoner der skal have lavet noget. De havde ingen vej videre.
          Denne ene linje giver dem den, uden at gøre siden til en B2C-side.

          ⚠️ KUN HVOR PRIVATE OPGAVER FAKTISK KOMMER (harPrivate, samme regel som
          resten af siden). På en IT- eller revisor-side ville linjen invitere en
          privatperson ind i en funnel, der ikke kan levere noget til hende.

          ⚠️ ALDRIG "relevante virksomheder" eller "de rette virksomheder". Birdly
          screener eller udvælger ikke nogen — vi matcher på fag og område. Den
          skelnen gælder al B2C-tekst, også denne ene sætning. */}
      {harPrivate && (
        <section>
          <div className="wrap center" style={{ maxWidth: 760 }}>
            <p className="lead" style={{ fontSize: 16 }}>
              Skal du i stedet have udført en privat {nounSingular}-opgave?{" "}
              <Link href="/opret-opgave">Opret den gratis på Birdly</Link> — så sender vi
              den til virksomheder i dit område, hvis fag og område passer.
            </p>
          </div>
        </section>
      )}

      {/* VÆRDIEN, lige før den sidste CTA: 365 dage mod årsprisen, med det
          betingede anker ("kan betale … mange gange hjem"). */}
      {/* ⚠️ SIDENS EGET FAG, ikke konteksten. En VVS-side skal regne på en
          VVS-opgave; uden proppen ville den falde tilbage på rengøring. */}
      <Vaerdi funnelHref={funnel} fag={fagKey} />

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
      {/* ⚠️ `knap` SKAL SÆTTES. Uden den faldt StickyCta tilbage på sin default
          "Kom i gang gratis" — så stod der ÉN ordlyd i headeren og en anden i
          den sticky bjælke, på alle 36 fag-sider. Huset har én primær CTA. */}
      <StickyCta
        href={funnel}
        knap="Find opgaver nu"
        tekst={region ? `Opgaver for ${nounPlural} ${region.praep} ${region.navn}` : `Opgaver for ${nounPlural} — direkte på SMS`}
      />

      {/* FAQ structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </div>
  );
}
