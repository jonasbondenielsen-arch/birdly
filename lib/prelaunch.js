// Prelaunch-flag — ÉT sted. Styrer hele "Åbner snart"-laget.
//
// NEXT_PUBLIC_PRELAUNCH="true"  => prelaunch-laget vises, /tilmeld spærres,
//                                  CTA'er bliver til "Skriv dig på venteliste".
// alt andet (inkl. manglende)   => false (vi spærrer ALDRIG prod ved et uheld).

/** @returns {boolean} */
export function isPrelaunch() {
  return process.env.NEXT_PUBLIC_PRELAUNCH === "true";
}
