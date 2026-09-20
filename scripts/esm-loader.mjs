// ============================================================================
// Lader Node importere husets klientmoduler direkte.
//
// ⚠️ NEXT RESOLVER UDVIDELSER, NODE GOER IKKE. `import { maa } from "./samtykke"`
// virker i bundleren og fejler i Node. Uden den her hook kan en vagt ikke koere
// den RIGTIGE lib/-fil — kun en kopi, og en kopi beviser ingenting.
//
// ⚠️ DEN AENDRER INTET I KODEN. Den tilfoejer kun ".js" naar en relativ sti ikke
// kan oploeses som den staar. Alt andet gaar uroert videre til Node.
//
//   node --import ./scripts/esm-loader.mjs scripts/<vagt>.mjs
// ============================================================================
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./esm-loader-hook.mjs", pathToFileURL("./scripts/"));
