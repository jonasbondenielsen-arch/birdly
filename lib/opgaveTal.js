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
    // ⚠️ Valideres på `bydbare` — det felt baren FAKTISK viser. Den tjekkede før `i_alt`, som blev fjernet fra Edge Function'en
    // da branchetallene røg; så returnerede den null for alt, og fallbacken skjulte
    // baren på hele sitet uden en eneste fejl i loggen. Valider altid på det felt
    // der bruges — ellers opdages et manglende felt først som en tom side.
    return typeof b?.bydbare === "number" ? b : null;
  } catch {
    return null;
  }
}

// antalForFag/antalForFagGeo er FJERNET (30-07-2026). Alle sider viser samme tal —
// hele den bydbare beholdning. Et branchetal er ærligt, men et dårligt salgsargument:
// en VVS-side der siger "7 opgaver" sælger værre end ingen tal, og et fag med 0 i en
// stille uge ser ud som et dødt produkt. Edge Function'en beregner dem heller ikke
// længere, så der er intet at hente.

/** Dansk tusindtalsformat: 291 → "291", 1291 → "1.291". */
export function daTal(n) {
  return typeof n === "number" ? n.toLocaleString("da-DK") : "";
}

/**
 * "3. aug. kl. 14:00" — dansk, kort, med klokkeslæt så to daglige kørsler kan ses.
 *
 * ⚠️ ÉN FORMATTER, ÉT STED (03-08-2026). Den lå inde i NyForside, og da baren også
 * skulle vise tidspunktet, ville en kopi have givet to formater der langsomt kom til
 * at se forskellige ud på samme side. Begge læser den her.
 *
 * ⚠️ Kaldes KUN med et tidsstempel fra data (`sidst_opdateret` = seneste gennemførte
 * ingest-kørsel). ALDRIG new Date(): en klokke der viser "nu" beviser ingenting om
 * hvornår vi sidst hentede — den ville stå og lyve friskhed ved hver sidevisning.
 *
 * Ugyldigt eller manglende input → null, og kalderen udelader linjen frem for at
 * skrive "Opdateret Invalid Date".
 *
 * ⚠️ TIDSZONEN ER LÅST TIL KØBENHAVN — OG DET ER IKKE PYNT (03-08-2026).
 * Uden `timeZone` formaterer JavaScript i den tidszone koden tilfældigvis kører i.
 * Målt på 14:00:50Z: Vercels servere kører UTC og skrev "kl. 14:00"; en dansk
 * browser skrev "kl. 16:00". Det gav to fejl på én gang:
 *
 *   • Salgssiden er en SERVER-komponent → stod på 14:00. To timer bagud for hver
 *     eneste danske besøgende.
 *   • Baren sidder inde i Forside, som er en KLIENT-komponent → serveren sendte
 *     14:00, browseren hydrerede og skrev 16:00 ovenpå. Tallet skiftede for
 *     øjnene af brugeren, og server- og klient-markup var uenige.
 *
 * Alle Birdlys brugere og alle udbud er danske, og ingest-kørslen er dansk. Der
 * findes derfor ét rigtigt klokkeslæt, og det er Københavns. Låst her, så det er
 * det samme uanset hvor koden kører. Europe/Copenhagen håndterer selv sommertid.
 */
const TZ = "Europe/Copenhagen";

export function fmtOpdateret(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dato = d.toLocaleDateString("da-DK", { day: "numeric", month: "short", timeZone: TZ });
  // ⚠️ Kolon, ikke punktum. da-DK's toLocaleTimeString giver "16.00"; det er formelt
  // korrekt dansk, men punktum midt i et klokkeslæt læses let som en dato. Kolon er
  // det folk forventer på en skærm.
  const tid = d
    .toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
    .replace(".", ":");
  return `${dato} kl. ${tid}`;
}

// ⚠️ rundNed ER FJERNET (03-08-2026) — og skal ikke laves igen.
//
// Den rundede tallet ned, så "over X" blev ved med at være sandt mellem to
// cache-opdateringer: 455 → "over 400". Prisen var at forsiden underdrev
// beholdningen med op mod 20 %, og at to sider kunne vise hvert sit afrundede
// tal uden at nogen opdagede det.
//
// Løsningen er ikke en pænere afrunding, men at vise det PRÆCISE tal sammen med
// tidspunktet det blev hentet (fmtOpdateret). Så er tallet sandt, og der står
// sort på hvidt hvornår det var sandt. Leder du efter en afrundingsfunktion,
// er det formentlig fordi et tal mangler sin dato.
