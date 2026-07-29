// ============================================================================
// OPGAVE-TAL — levende antal aktive opgaver.
//
// Hentes fra Edge Function'en get-opgave-tal, fordi dette repo kun har anon-nøglen
// og RLS spærrer `notices` helt (målt: anon får 0 rækker). Funktionen returnerer KUN
// heltal — aldrig titler, købere eller id'er.
//
// ⚠️ KASTER ALDRIG. Fejler kaldet, returnerer vi null, og baren viser sin tekst UDEN
// tal. Et gæt eller et "0 opgaver" på forsiden er værre end ingen tæller: det første
// er usandt, det andet ligner et dødt produkt.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Serveren cacher 10 min (s-maxage). Her revalideres i samme takt, så en side der
// bygges statisk henter friske tal uden at hver besøgende rammer funktionen.
const REVALIDER_SEK = 600;

export async function hentOpgaveTal() {
  if (!SUPABASE_URL || !ANON) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/get-opgave-tal`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
      next: { revalidate: REVALIDER_SEK },
    });
    if (!res.ok) return null;
    const b = await res.json();
    return typeof b?.i_alt === "number" ? b : null;
  } catch {
    return null;
  }
}

/** Antal for ét fag. null = ukendt (vis intet tal, ikke et nul). */
export function antalForFag(tal, fagKey) {
  const n = tal?.pr_branche?.[fagKey];
  return typeof n === "number" ? n : null;
}

/** Antal for ét fag i én region. null = ukendt. */
export function antalForFagGeo(tal, fagKey, regionKey) {
  const n = tal?.pr_fag_geo?.[`${fagKey}:${regionKey}`];
  return typeof n === "number" ? n : null;
}

/** Dansk tusindtalsformat: 291 → "291", 1291 → "1.291". */
export function daTal(n) {
  return typeof n === "number" ? n.toLocaleString("da-DK") : "";
}

/**
 * Runder NED til et pænt tal, så "over X" altid er sandt med god margin.
 * 1.076 → 1.000 · 428 → 400 · 328 → 300 · 96 → 90
 *
 * Nedrunding frem for nærmeste: "over 1.100" ved 1.076 ville være løgn. Og et rundt
 * tal med "over" foran holder også når beholdningen svinger et par stykker fra dag
 * til dag — vi vil ikke have et tal på forsiden der kan blive usandt mellem to
 * cache-opdateringer.
 */
export function rundNed(n) {
  if (typeof n !== "number" || n <= 0) return 0;
  if (n >= 1000) return Math.floor(n / 1000) * 1000;
  if (n >= 100) return Math.floor(n / 100) * 100;
  if (n >= 10) return Math.floor(n / 10) * 10;
  return n;
}
