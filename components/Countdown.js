"use client";

import { useEffect, useState } from "react";

// Live nedtælling mod en FAST deadline (ens for alle besøgende). Klient-only:
// ms = null indtil mount (ingen hydration-mismatch). Tikker hvert sekund.
// Returnerer null når deadline er passeret (kalder onExpire), så et udløbet ur
// aldrig viser noget pinligt.
export default function Countdown({ deadline, onExpire }) {
  const [ms, setMs] = useState(null);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const left = deadline.getTime() - Date.now();
      setMs(left);
      if (left <= 0 && onExpire) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  if (ms === null || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <span className="cd" aria-label="Tilbud slutter om">
      <span className="cd-u"><b>{d}</b>d</span>
      <span className="cd-u"><b>{pad(h)}</b>t</span>
      <span className="cd-u"><b>{pad(m)}</b>m</span>
      <span className="cd-u cd-sec"><b>{pad(sec)}</b>s</span>
    </span>
  );
}
