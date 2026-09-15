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
//
// ⚠️ 14 → 7 DAGE (besluttet 14-09-2026). Ændringen gælder KUN nye aftaler.
// Eksisterende kunder beholder de 14 dage de fik lovet, og de holdes ikke af
// dette tal: hver kunde har sin egen `trial_ends_at` låst i databasen fra
// tilmeldingsøjeblikket. Sænkes konstanten her, flytter ingen eksisterende
// kundes dato sig — det er hele grunden til at datoen er en KOLONNE og ikke en
// udregning. Se migration 0142.
export const TRIAL_DAYS = 7;

// ⚠️ IKRAFTTRÆDELSESDATOEN, OG DEN ER JURIDISK — IKKE KOSMETIK.
// Abonnementsbetingelsernes pkt. 2.1 skal kunne sige HVILKE aftaler der har 7
// dage og hvilke der har 14. Datoen står derfor ét sted og renderes ind i de
// juridiske dokumenter derfra; skrives den som tekst i en .md-fil, kan de to
// komme i utakt, og så har vi to forskellige løfter i omløb.
//
// ⚠️ SAT AF JONAS 14-09-2026: ikrafttrædelsen er 15-09-2026.
//
// ⚠️ DATOEN ER UAFHÆNGIG AF HVORNÅR DER DEPLOYES, og det er med vilje.
// Første udgave koblede de to: migrationen satte prøven til 7 i det sekund den
// kørte. Pushede vi den 14., ville en kunde der tilmeldte sig samme aften få 7
// dage i databasen, mens de betingelser hun netop havde accepteret sagde 14.
// Hun ville få mindre end kontrakten lover — den forkerte fejlretning.
//
// `create_signup` spørger derfor om datoen, ikke om deploy-tidspunktet (se
// migration 0145), og den gør det i KUNDENS eget markeds tidszone. Deployet må
// ligge hvor som helst omkring den 15.; kode og betingelser siger det samme
// hele vejen igennem, og hullet kan ikke opstå.
//
// ⚠️ DATOEN STÅR OGSÅ I 0145, OG DE SKAL VÆRE ENS.
// scripts/verify-proeve7.mjs i birdly-admin sammenligner dem og fejler hvis de
// skrider — bevist med negativ test.
//
// Formatet er ISO (YYYY-MM-DD), fordi det er det eneste der ikke kan læses
// forkert af et menneske eller en parser.
export const PROEVE7_FRA_DATO = "2026-09-15";

/** Ikrafttrædelsesdatoen som dansk tekst ("15. september 2026") til jura og copy. */
export const PROEVE7_FRA_DATO_DA = new Date(PROEVE7_FRA_DATO + "T00:00:00Z")
  .toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Samme dato på en-GB ("15 September 2026") til de britiske dokumenter. */
export const PROEVE7_FRA_DATO_EN = new Date(PROEVE7_FRA_DATO + "T00:00:00Z")
  .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Prøvelængden for aftaler indgået FØR ikrafttrædelsen. Kun jura bruger den. */
// ⚠️ HVOR MANGE DAGE FØR PRØVESLUT VI SIGER TIL (15-09-2026).
//
// Tallet står her fordi det er et LØFTE i abonnementsbetingelsernes pkt. 2.4 —
// altså kundevendt tekst, og dermed dette repos ansvar. SELVE afsendelsen sker i
// birdly-admin (`lib/reminder/runReminder.js`, `VARSEL_DAGE`), og de to tal SKAL
// være ens: lover juraen to dage og motoren sender på tre, står der ét sted noget
// der ikke passer. `scripts/verify-proevetal.mjs` i birdly-admin holder dem enige
// og fejler ved drift — samme konstruktion som PROEVE7_FRA_DATO.
//
// ⚠️ KUN E-MAIL. Betingelserne lovede tidligere "typisk også på SMS". SMS'en blev
// fjernet fra varslet 15-09-2026, og løftet er rettet med. Sætter nogen SMS'en
// tilbage, skal teksten med igen.
export const VARSEL_DAGE = 2;

export const TRIAL_DAYS_FOER = 14;

// Besparelse ved årsbetaling — regnestykket, så det kan vises præcist OG som
// aktivt salgsargument: 499×12 = 5.988 → 4.990 = spar 998 kr (~17 %, 2 mdr).
// Bemærk at 4.990 ÷ 499 er PRÆCIS 10, så "betal for 10 måneder, få 12" er bogstaveligt
// sandt — ikke en afrunding. Tallene nedenfor beregnes, så de aldrig kan komme i utakt.
// ⚠️ Tallene i kommentarerne herunder stod tilbage fra 299-prisen (3588/598) og
// passede ikke længere til 499. Selve udregningen har altid været rigtig — men i
// PRISFILEN er en forkert kommentar farlig: den er det næste menneske læser før
// han hardkoder et beløb et sted. Rettet 03-08-2026.
const monthlyTotal = PLAN.monthly * 12;                         // 5988
const savingAmount = monthlyTotal - PLAN.yearly;                // 998
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
  // Lang form til brødtekst: "499 kr. om måneden" læses bedre i en sætning end
  // "499 kr./md.", som hører hjemme på et priskort. Samme tal, samme kilde.
  monthlyLong: `${kr(PLAN.monthly)} kr. om måneden`,
  yearlyLong: `${kr(PLAN.yearly)} kr. om året`,
  saveShort: `spar ~${YEARLY_SAVING.pct} %`,
  // ⚠️ BARE BELØB UDEN ENHED. Nogle sætninger bærer selv perioden — "4.990 kr.
  // for et helt år", "Hvorfor koster årsplanen 4.990 kr.?" — og dér gav
  // priceText.yearly ("4.990 kr./år") en dublet: "4.990 kr./år for et helt år".
  // Løsningen er IKKE at skrive tallet i hånden det ene sted; så står prisen to
  // steder igen (CLAUDE.md, "Pris — REGLERNE"). Den er at have begge former her.
  monthlyBare: `${kr(PLAN.monthly)} kr.`,
  yearlyBare: `${kr(PLAN.yearly)} kr.`,
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
