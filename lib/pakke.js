// =====================================================================
// Pakke-logik (Del C) — pakken UDLEDES af kundens geografivalg.
// Øst/vest for Storebælt. Entydige regler (se masterplan §4 / trin 4 Del C):
//   - præcis ÉN region                         -> Spurv (349)
//   - præcis HELE øst (hovedstaden+sjaelland)   -> Falk  (499)
//   - præcis HELE vest (syd+midt+nord)          -> Falk  (499)
//   - alt andet (delmængde, på tværs, hele DK)  -> Albatros (1.199)
// Falk = en HEL landsdel — ikke en delmængde, ikke på tværs af Storebælt.
// Intern DB-nøgle for Falk er 'eagle' (vises som "Falk").
// =====================================================================

export const OEST = ["hovedstaden", "sjaelland"];
export const VEST = ["syddanmark", "midtjylland", "nordjylland"];

export const PACKAGES = {
  spurv: { key: "spurv", label: "Spurv", price: 349 },
  eagle: { key: "eagle", label: "Falk", price: 499 },
  albatros: { key: "albatros", label: "Albatros", price: 1199 },
};

// regionKeys = de valgte af de 5 regioner. heleDk = "hele Danmark"-valget.
// Returnerer en pakke fra PACKAGES, eller null hvis intet er valgt endnu.
export function derivePackage(regionKeys, heleDk) {
  if (heleDk) return PACKAGES.albatros;
  const sel = [...new Set(regionKeys || [])];
  const n = sel.length;
  if (n === 0) return null;
  if (n === 1) return PACKAGES.spurv;
  const set = new Set(sel);
  const isAllOest = n === OEST.length && OEST.every((r) => set.has(r));
  const isAllVest = n === VEST.length && VEST.every((r) => set.has(r));
  if (isAllOest || isAllVest) return PACKAGES.eagle;
  return PACKAGES.albatros;
}

// Blid, positiv besked om hvad valget giver — værdi før pris.
export function packageMessage(regionKeys, heleDk, regionLabels) {
  const pkg = derivePackage(regionKeys, heleDk);
  if (!pkg) return null;
  const labelOf = (k) => (regionLabels && regionLabels[k]) || k;
  const sel = [...new Set(regionKeys || [])];

  let hvad;
  if (heleDk) hvad = "hele Danmark";
  else if (pkg.key === "eagle" && sel.length === 2) hvad = "hele Østdanmark (Hovedstaden + Sjælland)";
  else if (pkg.key === "eagle" && sel.length === 3) hvad = "hele Vestdanmark (Syd-, Midt- & Nordjylland)";
  else if (sel.length === 1) hvad = labelOf(sel[0]);
  else hvad = sel.map(labelOf).join(", ");

  return {
    pkg,
    text: `Med ${hvad} får du ${pkg.label} — ${pkg.price.toLocaleString("da-DK")} kr./md.`,
  };
}
