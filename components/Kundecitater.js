import { KUNDECITATER, KUNDECITAT_KICK } from "../lib/kundecitater";

// ============================================================================
// KUNDEUDTALELSER — ÉT KORT, TO FLADER (polish 07-10-2026)
//
// ⚠️ SAMME KORT BEGGE STEDER. Funnelen og forsiden havde hver sin udgave, og
// de begyndte straks at drive: den ene fik en teal venstrestreg, den anden
// ikke. Ét `KundecitatKort` og to tynde wrappere betyder at en rettelse af
// hvordan et citat SER UD, kun skal laves ét sted.
//
// ⚠️ HVAD DER BLEV RETTET. Begge udgaver lignede en informationsboks: lyseblå
// flade eller en kraftig teal streg i venstre kant — husets eget formsprog for
// SYSTEMBESKEDER (`.st-hit`, `.st-abon`, `.st-naeste-trin`). Et kundecitat i
// den dragt læses som noget systemet fortæller, ikke som noget et menneske har
// sagt. Nu: hvidt kort, husets kant, radius og skygge, et stort dæmpet
// anførselstegn som signal, og teal KUN i avatarens bogstaver.
//
// ⚠️ INGEN STJERNER, INGEN SLIDER, INGEN ROTATION. Ingen af de to har afgivet
// en rating, og en tekst der flytter sig mens man læser den, er værre end
// ingen bevægelse.
//
// ⚠️ INGEN "use client". Ren markup, ingen tilstand, ingen effekt — og derfor
// heller ingen sporing herfra.
// ============================================================================

/**
 * Ét citat. Avataren bærer VIRKSOMHEDENS initialer (felt i kilden, ikke udledt
 * af navnet — se noten i lib/kundecitater.js).
 *
 * ⚠️ KORTENE TVINGES IKKE I SAMME HØJDE. Tobias' citat er fire ord; strakt op
 * til Tessies tre linjer ville det give en tom flade der ser ud som om der
 * mangler noget. `align-items: start` i griddet lader hvert kort være så højt
 * som sit eget indhold.
 */
function KundecitatKort({ k }) {
  return (
    <figure className="kc-kort">
      {/* ⚠️ TEGNET ER DEKORATION OG SKAL IKKE LÆSES OP. Citatet står i
          blockquote lige under; en skærmlæser der sagde "venstre dobbelt
          anførselstegn" først, ville bare støje. */}
      <span className="kc-citattegn" aria-hidden="true">&ldquo;</span>
      <blockquote>{k.citat}</blockquote>
      <figcaption className="kc-person">
        <span className="kc-avatar" aria-hidden="true">{k.initialer}</span>
        <span className="kc-navn">
          <b>{k.navn}</b>
          <i>{k.firma}</i>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * FUNNELEN — begge citater direkte under CVR-kortet.
 *
 * ⚠️ INGEN SEKTIONS-LABEL HER. "BRUGT AF DANSKE RENGØRINGSVIRKSOMHEDER" stod
 * over kortet og gjorde det til en afdeling på siden. På /start skal
 * anmeldelserne tale for sig selv — hierarkiet er CVR → knap → bevis, og en
 * overskrift mere imellem ville stjæle af knappen.
 */
export function KundecitatPar() {
  return (
    <div className="kc-par kc-par-funnel">
      {KUNDECITATER.map((k) => <KundecitatKort k={k} key={k.navn} />)}
    </div>
  );
}

/**
 * FORSIDEN — samme to kort, med en diskret label, tæt på heroen.
 *
 * ⚠️ `sg-sek-taet` IKKE `sg-sek`. Den tætte sektionspadding er husets egen, og
 * den er valgt fordi hero → trust → anmeldelser skal læses som ÉT forløb. Med
 * den normale sektionsafstand lå citaterne en halv skærm under trust-linjen og
 * mistede forbindelsen til løftet de skulle bevise.
 */
export function KundecitatRaekke() {
  return (
    <section className="sg-sek-taet kc-sektion">
      <div className="kc-midte">
        <span className="kc-label">{KUNDECITAT_KICK}</span>
        <div className="kc-par">
          {KUNDECITATER.map((k) => <KundecitatKort k={k} key={k.navn} />)}
        </div>
      </div>
    </section>
  );
}
