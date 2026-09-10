// ============================================================================
// STARTER MAALESERVEREN — OG EFTERLADER ET BEVIS PAA HVORNAAR DEN STARTEDE.
//
// ⚠️ DEN FINDES FORDI EN FORAELDET SERVER ER USYNLIG.
// `next start` laeser .next EEN gang ved opstart. Bygger man bagefter, bliver
// processen ved med at svare fra det gamle build — samme port, samme svar,
// ingen fejl. 10-09-2026 kostede netop det en hel fejlsoegning: den britiske
// fejlside blev bygget og maalt seks gange i traek uden at aendre sig, fordi et
// `Stop-Process`-filter ikke ramte selve serverprocessen. Alle seks
// konklusioner var forkerte, og ingen af dem saa forkerte ud.
//
// ⚠️ HVORFOR IKKE BARE PROBE SERVEREN? Det blev proevet foerst, og begge
// oplagte probes fejler:
//   · chunk-navne er indholds-hashede og genbruges naar filen er uaendret,
//   · .next/BUILD_ID er deterministisk og var IDENTISK paa tvaers af builds.
// En gammel server svarer altsaa med praecis de samme markoerer som en frisk.
// Derfor maales ikke paa svaret, men paa livscyklussen: den her fil skriver
// hvornaar serveren startede, og render-dk.mjs naegter at maale hvis det
// tidspunkt ligger FOER buildet.
//
//   node scripts/start-server.mjs [port]
// ============================================================================
import { spawn } from "node:child_process";
import { existsSync, writeFileSync, statSync } from "node:fs";

const PORT = Number(process.argv[2] || process.env.PORT || 3101);

if (!existsSync(".next/BUILD_ID")) {
  console.error("✖ Der er ikke bygget (.next/BUILD_ID mangler). Koer `npm run build` foerst.");
  process.exit(2);
}

writeFileSync(
  ".next/SERVER_BOOTED",
  JSON.stringify({ port: PORT, tid: Date.now(), byggetTid: statSync(".next/BUILD_ID").mtimeMs }),
  "utf8"
);

const barn = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "inherit", shell: true });
barn.on("exit", (kode) => process.exit(kode ?? 0));
