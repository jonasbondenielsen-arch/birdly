// ---------------------------------------------------------------------------
// AI-KONTROLFLADEN — kundens forbindelser til ChatGPT og Claude.
//
// ⚠️ DETTE REPO AFGØR INGENTING. Det viser hvad admin svarer og sender kundens
// frakobling videre. Adgangen, samtykket og revocation bor i birdly-admin, som
// er det eneste sted der har service-nøglen. En kopi af reglen her ville drive
// fra serverens — præcis som klassificeringen i fase 2 ikke må ligge to steder.
//
// ⚠️ ORDET "MCP" STÅR IKKE ÉT STED I NOGET KUNDEN SER. Det er vores arkitektur,
// ikke hendes produkt. Hun forbinder "din AI", ikke "en MCP-server".
// ---------------------------------------------------------------------------
const ADMIN = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.birdly.dk";

/** Kundens forbindelser. Kaster ALDRIG — siden viser en rolig tom tilstand. */
export async function hentAiAdgang(token) {
  try {
    const r = await fetch(`${ADMIN}/api/kunde/ai?token=${encodeURIComponent(token)}`, { cache: "no-store" });
    if (!r.ok) return { found: false, forbindelser: [], kan_forbinde: false };
    return await r.json();
  } catch {
    return { found: false, forbindelser: [], kan_forbinde: false };
  }
}

/** Frakobler. ⚠️ Kaster ved fejl, så knappen kan vise at det IKKE lykkedes. */
export async function frakoblAi(token, forbindelseId) {
  const r = await fetch(`${ADMIN}/api/kunde/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, handling: "frakobl", forbindelse_id: forbindelseId }),
  });
  const b = await r.json().catch(() => ({}));
  if (!r.ok || !b.ok) throw new Error(b.grund || "Kunne ikke frakoble.");
  return true;
}

/** Adressen kunden skal indsætte i sin AI. ⚠️ Ét sted, så de to sider ikke kan blive uenige. */
export const AI_ADRESSE = `${ADMIN}/api/mcp/customer`;
