// ============================================================================
// HVILKEN COMMIT KØRER LIGE NU?
//
// ⚠️ HVORFOR DEN FINDES. "Er min ændring live?" har indtil 16-09-2026 været et
// ræsonnement, ikke et opslag. Man kunne se at git havde pushet, at Vercels
// integration havde meldt success, og at domænet serverede ET deployment — men
// det sidste led, at netop DET deployment er netop DEN commit, krævede
// Vercel-adgang. Svaret blev derfor "ved udelukkelse: produktionsaliaset peger
// på det nyeste lykkede deployment". Det er et argument, ikke en aflæsning.
//
// Vercel sætter commit-SHA'en som miljøvariabel ved build. Ruten her lægger den
// ud, og spørgsmålet bliver et opslag.
//
// ⚠️ DEN ER BEVIDST ÅBEN. Alt den røber er hvilken commit der kører — og det
// kan enhver alligevel se i det offentlige repo. En hemmelighed her ville gøre
// vagten ubrugelig netop når man har brug for den: når man ikke kan komme til
// nøglerne. Den må ALDRIG udvides med andet end det nedenfor; skal den bære
// noget internt, hører det til bag CRON_SECRET som de øvrige.
//
// ⚠️ INGEN CACHE. En cachet version er en løgn om hvad der kører.
// ============================================================================
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      app: "birdly",
      // Sættes automatisk af Vercel ved build. Lokalt er de undefined — og da
      // siger svaret "ukendt" frem for at lade som om der er en commit.
      commit: process.env.VERCEL_GIT_COMMIT_SHA || "ukendt",
      kort: (process.env.VERCEL_GIT_COMMIT_SHA || "ukendt").slice(0, 7),
      gren: process.env.VERCEL_GIT_COMMIT_REF || "ukendt",
      miljoe: process.env.VERCEL_ENV || "lokalt",
      besked: (process.env.VERCEL_GIT_COMMIT_MESSAGE || "").split("\n")[0] || null,
      tid: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
