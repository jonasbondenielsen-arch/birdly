import "../../kundecitater.css";

// ⚠️ INSPEKTIONSSIDEN. Den viser de to previews i to viewports ved siden af
// hinanden. Mobilen er en 390 px bred IFRAME — og det er ikke en attrap:
// media queries evalueres mod iframens egen bredde, så `@media (max-width:
// 900px)` og `(max-width: 560px)` rammer ægte. Det var den eneste vej til et
// rigtigt mobilbillede, fordi automatiserings-browseren ikke kan skifte
// viewport.
export const metadata = {
  title: "Preview — Growth #2",
  robots: { index: false, follow: false, nocache: true },
};

const RAMMER = [
  ["Desktop 1280", 1280, 900],
  ["Mobil 390", 390, 844],
];

// ⚠️ `?kun=mobil` / `?kun=desktop` viser kun den ene bredde. Det er ikke pynt:
// de to rammer kan ikke staa ved siden af hinanden i et 1568 px vindue, og en
// browser der ikke kan skifte viewport kan derfor ikke faa et rent
// mobilbillede uden den her.
const vaelg = (kun) => kun === "mobil" ? RAMMER.slice(1) : kun === "desktop" ? RAMMER.slice(0, 1) : RAMMER;

function Blok({ titel, sti, rammer }) {
  return (
    <div>
      <div className="pv-topbar"><b>{titel}</b> — {sti}</div>
      <div className="pv-rammer">
        {rammer.map(([navn, w, h]) => (
          <div className="pv-ramme" key={navn}>
            <h3>{navn}</h3>
            <iframe src={sti} width={w} height={h} title={`${titel} ${navn}`} loading="eager" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const rammer = vaelg(sp?.kun);
  // ⚠️ `?side=start|uden|forside` viser kun én blok. Samme grund som `?kun`:
  // inspektionssiden skal kunne vise præcis ét billede ad gangen, fordi
  // browseren her hverken kan scrolle eller skifte viewport.
  const side = sp?.side || null;
  const vis = (n) => !side || side === n;
  return (
    <div style={{ background: "var(--grey)", minHeight: "100vh" }}>
      <div className="pv-topbar" style={{ background: "#7a1f1f" }}>
        <b>GROWTH #2 PREVIEW</b> — ikke produktion · ingen sporing · noindex · branch growth-2-preview
      </div>
      {vis("start") && <Blok titel="/start skærm 1 — med matches-linjen" sti="/preview/growth2/start" rammer={rammer} />}
      {vis("uden") && <Blok titel="/start skærm 1 — UDEN matches-linjen" sti="/preview/growth2/start?uden=1" rammer={rammer} />}
      {vis("forside") && <Blok titel="Forside — hero + citater højt" sti="/preview/growth2/forside" rammer={rammer} />}
    </div>
  );
}
