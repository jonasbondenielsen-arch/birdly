import { TRIAL_DAYS } from "../../lib/pakke";

// ============================================================================
// FORSIDENS FORENKLEDE HERO — KUN ROD-RUTEN (Growth #2, 07-10-2026)
//
// ⚠️ EN NY KOMPONENT FREM FOR EN NY PROP PÅ <Hero>. Den delte `Hero` i
// Sektioner.js bruges af /kom-i-gang, /hvorfor-birdly, /priser og af det
// britiske marked gennem ordbogen. Skulle den kunne levere BÅDE den gamle
// to-kolonne-hero med telefon, chips og to CTA'er OG den her, ville den få
// fire nye props og et sæt betingelser — og hver af de andre sider ville
// kunne flytte sig af en ændring der kun var tænkt til forsiden. Den delte
// komponent er derfor rørt med NUL tegn.
//
// ⚠️ HYPOTESEN ER "MINDRE FORKLARING FØR FØRSTE HANDLING". Derfor er pill,
// chips, SMS-telefonen og den sekundære CTA væk herfra. Ingen af delene er
// slettet fra kodebasen — de lever uændret i <Hero> på de øvrige sider.
//
// ⚠️ GENBRUGTE KLASSER: sg-hero · sg-wrap · sg-midt · sg-big · sg-em ·
// sg-lead · sg-btn · sg-btn-teal · sg-btn-stor · sg-trust. Det eneste nye er
// `h2-hero*`, som kun sætter bredde og centrering.
// ============================================================================

// ⚠️ DE TRE ER HUSETS EGNE, og de står ordret som på /start's skærm 1
// (`st-pre-trust`). Samme tre løfter to steder — ikke to varianter af dem.
const TRUST_TRE = ["Ingen portal", "Ingen daglig søgning", "Ingen kompliceret opsætning"];

export default function HeroEnkel({ funnelHref = "/start" }) {
  return (
    <section className="sg-hero h2-hero">
      <div className="sg-wrap">
        <div className="sg-midt">
          {/* ⚠️ RESULTATET, OG KANALEN I SAMME SÆTNING. "direkte på SMS" er
              ikke en feature her — det er formen resultatet ankommer i, og
              det er netop dét kunderne selv fremhæver. Se Tessies citat
              lige nedenfor på siden. */}
          <h1 className="sg-big">
            Få relevante rengøringsopgaver <span className="sg-em">direkte på SMS</span>
          </h1>

          {/* ⚠️ ÉN SÆTNING. Samme regel som den gamle hero: hver ekstra linje
              her koster af de fem sekunder løftet har til at blive forstået. */}
          <p className="sg-lead">
            Birdly finder offentlige og private opgaver, der passer til jeres virksomhed.
          </p>

          <div className="h2-hero-cta">
            {/* ⚠️ ÉN PRIMÆR CTA, OG DEN LOVER RESULTATET. "Se mine matches"
                er de samme ord som knappen på /start — kunden møder det samme
                løfte to gange i træk i stedet for to formuleringer af det.
                ⚠️ ALMINDELIGT <a>, IKKE <Cta>. `Cta` er en klient-komponent
                med sporing; forsidens hero-klik måles allerede, og en ekstra
                hændelse her ville tælle det samme klik to gange. */}
            <a className="sg-btn sg-btn-teal sg-btn-stor" href={funnelHref}>
              Se mine matches →
            </a>
          </div>

          {/* ⚠️ SAND OM DENNE KNAP. Den fører til /start, hvor der hverken
              oprettes en kunde eller bindes et kort. Prøvelængden kommer fra
              lib/pakke.js — aldrig et ciffer skrevet i hånden. */}
          <p className="h2-hero-fin">{TRIAL_DAYS} dage gratis · Ingen binding</p>

          <ul className="sg-trust" aria-label="Sådan er Birdly">
            {TRUST_TRE.map((t) => (
              <li key={t}><span aria-hidden="true">✓</span> {t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
