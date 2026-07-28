// =====================================================================
// Én flad pakke (juni 2026). Birdly gik fra tre tiers (Spurv/Falk/Albatros)
// til ÉN pakke med alt inkluderet: 499 kr/md ELLER 4.990 kr/år (ex. moms).
// Geografi (region eller hele Danmark) er INKLUDERET i samme pris og styrer
// kun matching — ikke prisen. Ingen tiers, intet pakkenavn.
//
// ⚠️ FRISBII ER DEN AUTORITATIVE PRISKILDE, ikke denne fil. Planerne er oprettet i
// Frisbii-dashboardet, og det er dem kunden faktisk betaler efter. Tallene her er et
// SPEJL til visning. Ændres prisen, skal den ændres i Frisbii FØRST — og derefter her,
// i prices-tabellen (migration) og i handelsbetingelsernes §3.1. Står de forskelligt,
// er det en markedsføringslovs- og aftaleretlig fælde.
//
// B2B: Birdly sælger kun til virksomheder, og B2B-priser oplyses ex moms (køber trækker
// momsen fra). Vis ALDRIG inkl.-moms som den fremhævede pris kundevendt. Momsen
// specificeres på fakturaen, som Frisbii genererer.
//
// PRISHISTORIK: 299/2.990 → 499/4.990 den 27-07-2026. Eksisterende kunder blev IKKE
// flyttet — de kører videre på den gamle Frisbii-planversion, jf. §5.4 om varsel ved
// prisstigning.
// =====================================================================

export const PLAN = {
  key: "birdly",
  label: "Birdly",
  monthly: 499, // kr./md. ex. moms
  yearly: 4990, // kr./år ex. moms (forudbetalt)
};

// Prøveperiodens længde ÉT sted (fodrer ribbon, trust-badges, success-card). SKAL
// matche trial'en på Frisbii-planerne (birdly-abonnement + -aar) — verificér i
// Frisbii-dashboardet før go-live. Selve betalings-trinnet bruger neutral tekst.
export const TRIAL_DAYS = 14;

// Besparelse ved årsbetaling — regnestykket, så det kan vises præcist OG som
// aktivt salgsargument: 499×12 = 5.988 → 4.990 = spar 998 kr (~17 %, 2 mdr).
// Bemærk at 4.990 ÷ 499 er PRÆCIS 10, så "betal for 10 måneder, få 12" er bogstaveligt
// sandt — ikke en afrunding. Tallene nedenfor beregnes, så de aldrig kan komme i utakt.
const monthlyTotal = PLAN.monthly * 12;                         // 3588
const savingAmount = monthlyTotal - PLAN.yearly;                // 598
export const YEARLY_SAVING = {
  monthlyTotal,
  yearly: PLAN.yearly,
  amount: savingAmount,
  pct: Math.round((savingAmount / monthlyTotal) * 100),         // 17
  months: Math.round(savingAmount / PLAN.monthly),              // 2
};

const kr = (n) => n.toLocaleString("da-DK");

// Færdige labels til UI (forside, funnel, FAQ) — så priser/besparelse står ÉT sted.
export const priceText = {
  monthly: `${kr(PLAN.monthly)} kr./md.`,
  yearly: `${kr(PLAN.yearly)} kr./år`,
  perMonthBoth: `${kr(PLAN.monthly)} kr./md. eller ${kr(PLAN.yearly)} kr./år`,
  saveShort: `spar ~${YEARLY_SAVING.pct} %`,
  saveLong: `Betal for 10 måneder, få 12 — spar ${kr(YEARLY_SAVING.amount)} kr. om året (~${YEARLY_SAVING.pct} %).`,
};

// Pakke-objekt til signup-payload (gemmes i signup_data.package — display + senere
// billing). interval følger kundens valg af betalingsfrekvens.
export function planForInterval(interval) {
  const yearly = interval === "year" || interval === "yearly";
  return {
    key: PLAN.key,
    label: PLAN.label,
    price: yearly ? PLAN.yearly : PLAN.monthly,
    interval: yearly ? "year" : "month",
  };
}
