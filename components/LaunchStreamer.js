"use client";

import { useLaunch } from "./useLaunch";
import Countdown from "./Countdown";
import { PLAN } from "../lib/pakke";

// Pris-banner ved pris-sektionen — samme deadline-kilde (useLaunch → samme env) som
// topbanneret, så de to ure er synkrone. Ligger ovenpå de normale pris-bokse uden at
// modsige dem. Gated på NEXT_PUBLIC_LAUNCH_DEADLINE (vises kun i launch-fasen).
export default function LaunchStreamer() {
  const { active, deadline } = useLaunch();
  if (!active) return null;
  return (
    <div className="launch-streamer reveal">
      <div className="ls-main">🎉 <b>Lige nu: Birdly er gratis</b> så længe nedtællingen kører — <Countdown deadline={deadline} /></div>
      <div className="ls-sub">Når den udløber, gælder de almindelige vilkår: 14 dages gratis prøve, derefter {PLAN.monthly} kr/md (eller {PLAN.yearly.toLocaleString("da-DK")} kr/år).</div>
    </div>
  );
}
