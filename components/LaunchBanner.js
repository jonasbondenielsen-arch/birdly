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
      <span className="lb-msg">🐦 <b>Birdly.dk har Danmarkspremiere</b> — gratis så længe nedtællingen kører. Skynd dig at prøve!</span>
      <Countdown deadline={deadline} />
      <Link href="/" className="lb-cta">Find opgaver nu</Link>
    </div>
  );
}
