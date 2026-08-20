// ============================================================================
// FLAG FOR "OPRET OPGAVE" — begge fejler LUKKET.
//
// ⚠️ SIDEN MÅ IKKE VÆRE SYNLIG I NAVIGATIONEN FØR CLEARHAUS ER I HUS.
// En offentlig "opret opgave"-side flytter Birdly fra ren B2B-udbudstjeneste mod et
// marketplace-element, og det kan påvirke hvordan indløseren ser på forretningen.
// Selve ruten /opret-opgave svarer altid — det er KNAPPEN i navigationen der er
// spærret, så siden kan vises frem uden at være fundet af nogen.
//
// ⚠️ ANMELDELSERNE ER EGET FLAG, og det er ikke overforsigtighed. De tre anmeldelser
// i mockuppen er OPDIGTEDE. Går de live som ægte, er det en overtrædelse af
// markedsføringsloven og Metas annoncepolitik. Delte de flag med navigationen, ville
// et enkelt "tænd siden" udgive falsk social proof i samme bevægelse. Derfor to flag:
// det ene kan tændes uden det andet, og anmeldelserne kræver en selvstændig beslutning
// truffet når der findes ÆGTE anmeldelser at vise.
//
// Mønsteret (env-variabel) er sitets eget — samme som NEXT_PUBLIC_LAUNCH_DEADLINE.
// ============================================================================

// Kun den eksplicitte streng "1" tænder. Alt andet — tom, usat, "true", "ja",
// stavefejl — er slukket. Et flag der kan tændes ved et uheld er ikke et flag.
function taendt(v) {
  return String(v || "").trim() === "1";
}

// Vis "Opret opgave"-knappen i markedsførings-navigationen.
export const OPRET_OPGAVE_I_NAV = taendt(process.env.NEXT_PUBLIC_OPRET_OPGAVE);

// Vis anmeldelses-sektionen. SKAL være slukket indtil anmeldelserne er ægte.
export const OPRET_OPGAVE_ANMELDELSER = taendt(process.env.NEXT_PUBLIC_OPRET_OPGAVE_ANMELDELSER);
