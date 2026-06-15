// 30-dages launch-fase (gratis adgang uden kort, indtil Frisbii kobles).
// ÉN env-variabel styrer alt: sticky banner, pris-streamer OG funnel-velkomstboks.
//
// NEXT_PUBLIC_LAUNCH_DEADLINE = ISO-dato/tid (fx "2026-07-15T23:59:00+02:00").
// Jonas sætter den til "nu + 30 dage" ved go-live. Build-time embedded (NEXT_PUBLIC),
// så en ændring kræver redeploy. Når deadline er passeret (eller unset) -> normal flow.

export function launchDeadline() {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_DEADLINE;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}
