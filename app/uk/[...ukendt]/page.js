import { notFound } from "next/navigation";

// ============================================================================
// ALT ANDET UNDER /uk.
//
// ⚠️ DEN FANGER DE DYBE STIER, [jura] FANGER DE ENKELTE.
// /uk/<eet-segment> rammer app/uk/[jura], som kalder notFound() naar slug'en
// ikke er et af de ni dokumenter. /uk/<to-eller-flere> matcher derimod INGEN
// rute og faldt derfor helt op i rodens DANSKE fejlside - maalt 10-09-2026 paa
// /uk/a/b. Den her rute matcher resten og kaster notFound(), saa begge veje
// ender i den samme boundary: app/uk/not-found.js.
//
// ⚠️ INGEN generateStaticParams. Der er intet at praeg-generere; ruten
// findes kun for at faa et engelsk 404-svar ud af en adresse vi ikke har.
export default function Side() {
  notFound();
}
