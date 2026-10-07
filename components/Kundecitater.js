import { KUNDECITATER, KUNDECITAT_KICK } from "../lib/kundecitater";

// ============================================================================
// KUNDEUDTALELSER — TO FLADER, ÉN KILDE (07-10-2026)
//
// ⚠️ INGEN ROTATION, INGEN STJERNER. Begge dele er fravalgt bevidst: en
// karrusel flytter tekst mens man læser den, og en stjernegrafik ville være en
// rating ingen af de to har afgivet.
//
// ⚠️ INGEN "use client". Komponenterne har ingen tilstand og ingen effekt —
// de er ren markup. Et unødigt klient-direktiv ville trække dem ind i
// klient-bundtet på en side der ellers er statisk.
//
// ⚠️ INTET NYT DESIGNSPROG. `sg-kort` er forsidens kort (hvid, 1px --line,
// --r, --shadow), `sg-kick`/`sg-prik` dens kicker, `st-pre-kick`/`st-prik`
// funnelens. Figure/blockquote/figcaption-markuppen er den der allerede lå
// klar i Sektioner.js' Kundebevis-sektion og ventede på ægte citater.
//
// ⚠️ SPORER INTET. Hverken ctaSporing, analytics eller pixel importeres.
// ============================================================================

/**
 * FORSIDEN — to kort side om side, umiddelbart efter heroen.
 *
 * ⚠️ `sg-to` ER TO SPALTER PÅ DESKTOP OG ÉN PÅ MOBIL, defineret i
 * kundecitater.css med husets eget breakpoint (900px) og samme gap som
 * `sg-tre`. Vi bruger ikke `sg-tre`: to kort i et tre-spalters grid giver en
 * tom tredjedel, og kortene bliver smallere end de behøver.
 */
export function KundecitatRaekke() {
  return (
    <section className="sg-sek-taet">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">
            <span className="sg-prik" aria-hidden="true" /> {KUNDECITAT_KICK}
          </span>
        </div>
        <div className="sg-to">
          {KUNDECITATER.map((k) => (
            <figure className="sg-kort kc-kort" key={k.navn}>
              <blockquote>{k.citat}</blockquote>
              <figcaption>
                <b>{k.navn}</b> · {k.firma}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * FUNNELEN — ét citat under CVR-kortet.
 *
 * ⚠️ ET KUNDEBEVIS, IKKE EN SYSTEMBOKS. Første udgave var en lyseblå
 * `--sky-soft`-kasse med kant — præcis det formsprog huset bruger til
 * OPLYSNINGER (`.st-hit`, `.st-abon`, `.st-naeste-trin`). Et citat i den
 * dragt læses som endnu en systembesked, ikke som et menneske der har sagt
 * noget. Nu er det hvidt kort med husets egen kant og skygge — samme
 * `st-kort`-familie som CVR-kortet lige over — med et dæmpet anførselstegn og
 * en teal streg i venstre kant som det eneste der skiller det ud.
 *
 * ⚠️ KUN TESSIE. Ét citat under handlingen; to ville konkurrere med CTA'en om
 * opmærksomheden på præcis det trin hvor CVR → knap skal være det klare fokus.
 */
export function KundecitatEnkelt({ nr = 0 }) {
  const k = KUNDECITATER[nr];
  if (!k) return null;
  return (
    <figure className="kc-enkelt">
      <span className="st-pre-kick kc-kick">
        <span className="st-prik" aria-hidden="true" /> {KUNDECITAT_KICK}
      </span>
      <blockquote>{k.citat}</blockquote>
      <figcaption>
        <b>{k.navn}</b> · {k.firma}
      </figcaption>
    </figure>
  );
}
