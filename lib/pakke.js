// =====================================================================
// Én flad pakke (juni 2026). Birdly gik fra tre tiers (Spurv/Falk/Albatros)
// til ÉN pakke med alt inkluderet: 299 kr/md ELLER 2.990 kr/år (ex. moms).
// Geografi (region eller hele Danmark) er INKLUDERET i samme pris og styrer
// kun matching — ikke prisen. Ingen tiers, intet pakkenavn.
// =====================================================================

export const PLAN = {
  key: "birdly",
  label: "Birdly",
  monthly: 299, // kr./md. ex. moms
  yearly: 2990, // kr./år ex. moms (forudbetalt)
};

// Prøveperiodens længde ÉT sted (fodrer ribbon, trust-badges, success-card). SKAL
// matche trial'en på Frisbii-planerne (birdly-abonnement + -aar) — verificér i
// Frisbii-dashboardet før go-live. Selve betalings-trinnet bruger neutral tekst.
export const TRIAL_DAYS = 14;

// Besparelse ved årsbetaling — regnestykket, så det kan vises præcist OG som
// aktivt salgsargument: 299×12 = 3.588 → 2.990 = spar 598 kr (~17 %, 2 mdr).
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
