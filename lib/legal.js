import fs from "node:fs";
import path from "node:path";
import { TRIAL_DAYS, TRIAL_DAYS_FOER, PROEVE7_FRA_DATO_DA, VARSEL_DAGE } from "./pakke";

// Read a legal document's markdown from content/legal/<slug>.md (build time).
// The .md files are the canonical, fully-written legal texts.

// ============================================================================
// ⚠️ TRE PLADSHOLDERE, OG DE FINDES AF EN GRUND (14-09-2026).
//
// Prøveperioden gik fra 14 til 7 dage. Tallet stod som ren tekst i
// abonnementsbetingelserne fire steder og i handelsbetingelserne ét — fem
// hardkodninger i netop de dokumenter hvor et forkert tal ikke er en tastefejl
// men et andet løfte end det vi opkræver efter.
//
// Pladsholderne gør at koden og juraen IKKE KAN komme i utakt: ændres
// TRIAL_DAYS, ændres betingelserne i samme deploy. Det er hele pointen. Og det
// er den samme disciplin som prisen allerede har (Frisbii → pakke.js →
// prices-tabellen → §3.1) — prøvelængden manglede bare at få den.
//
// ⚠️ DET ER EN SUBSTITUTION, IKKE EN OMSKRIVNING. Hver sætning står ordret som
// den blev gennemgået; det eneste der udskiftes er et tal og en dato. En
// juridisk tekst må ikke "forbedres" af en maskine, og gør det heller ikke her.
//
// ⚠️ UKENDT PLADSHOLDER ⇒ KAST. Står der en [PROEVE_…] vi ikke kender, er det
// enten en tastefejl i .md-filen eller en pladsholder nogen har glemt at koble
// op. Begge dele skal vælte builden frem for at blive publiceret ordret på en
// offentlig betingelsesside — det var præcis sådan UK-pakkens
// "[UK_REPRESENTATIVE_NAME]" kunne være endt i en privatlivspolitik.
// ============================================================================
const ERSTATNINGER = {
  "[PROEVE_DAGE]": String(TRIAL_DAYS),
  "[PROEVE_DAGE_FOER]": String(TRIAL_DAYS_FOER),
  "[VARSEL_DAGE]": String(VARSEL_DAGE),
  "[PROEVE_FRA_DATO]": PROEVE7_FRA_DATO_DA,
};

const PLADSHOLDER_RE = /\[PROEVE_[A-Z_]+\]/g;

export function readLegal(slug) {
  const raa = fs.readFileSync(path.join(process.cwd(), "content", "legal", `${slug}.md`), "utf8");
  const ud = raa.replace(PLADSHOLDER_RE, (fund) => {
    const v = ERSTATNINGER[fund];
    if (v === undefined) throw new Error(`legal/${slug}.md: ukendt pladsholder ${fund}`);
    return v;
  });
  // Dobbelt værn: en pladsholder med anden form (fx [TRIAL_DAYS]) fanges ikke af
  // regexen ovenfor. Den her linje fanger den i stedet for at lade den gå live.
  if (/\[[A-Z][A-Z0-9_]{3,}\]/.test(ud)) {
    const fund = ud.match(/\[[A-Z][A-Z0-9_]{3,}\]/)[0];
    throw new Error(`legal/${slug}.md: uerstattet pladsholder ${fund}`);
  }
  return ud;
}
