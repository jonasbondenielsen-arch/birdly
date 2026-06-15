"use client";

import Link from "next/link";
import { useLaunch } from "./useLaunch";
import Countdown from "./Countdown";

// Slank sticky top-bjælke i launch-fasen. Tidlig-adgang-vinkel (ALDRIG "test").
export default function LaunchBanner() {
  const { active, deadline } = useLaunch();
  if (!active) return null;
  return (
    <div className="launch-bar" role="region" aria-label="Tidlig adgang">
      <span className="lb-msg">🐦 Birdly er åben for de første — <b>30 dage gratis, helt uden kort.</b> Tilbuddet slutter om:</span>
      <Countdown deadline={deadline} />
      <Link href="/tilmeld" className="lb-cta">Kom i gang</Link>
    </div>
  );
}
