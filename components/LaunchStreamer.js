"use client";

import { useLaunch } from "./useLaunch";
import Countdown from "./Countdown";

// Streamer ved pris-sektionen — samme deadline-kilde som banneret (synkrone).
// Ligger ovenpå de normale pris-bokse uden at modsige dem.
export default function LaunchStreamer() {
  const { active, deadline } = useLaunch();
  if (!active) return null;
  return (
    <div className="launch-streamer reveal">
      <span>De næste <b>30 dage: gratis adgang, ingen kort.</b> Derefter 299 kr/md (eller 2.990 kr/år). Tilbuddet slutter om:</span>
      <Countdown deadline={deadline} />
    </div>
  );
}
