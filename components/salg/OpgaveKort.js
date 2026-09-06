// ============================================================================
// ET OPGAVEKORT — ægte data, eller ingenting.
//
// ⚠️ HVERT FELT KOMMER FRA preview-kandidater, som henter dem fra
// birdly_match_candidates_for. Der er ingen standardværdier, ingen "ukendt" og
// ingen udfyldning: mangler køber, frist eller beløb på den konkrete opgave,
// står linjen der slet ikke. Et kort med et opdigtet felt ville være falsk bevis
// på den mest troværdige plads på siden.
//
// ⚠️ HVAD DER BEVIDST IKKE ER HER:
//   · notice_id / links — man skal ikke kunne følge opgaven uden at være kunde
//   · CPV og NUTS       — man skal ikke kunne bygge sit eget filter
//   · esender           — kan være en konkurrent (fx Mercell). Køber er den
//                         ægte ordregiver, og kun den vises. Feltet findes ikke
//                         engang i kandidatsættet, så det kan ikke slippe ud.
//
// ⚠️ ALLE OPGAVER I KANDIDATSÆTTET ER OFFENTLIGE UDBUD (notice_type =
// 'ContractNotice'). Derfor er badget fast "OFFENTLIG OPGAVE" og ikke et gæt.
// Private opgaver ligger i en anden tabel og kommer ikke igennem her; skal de
// med en dag, skal badget udledes af data — ikke antages.
// ============================================================================

/** "18. september" — dansk, uden klokkeslæt. Ugyldig dato ⇒ null, linjen udgår. */
function fmtFrist(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("da-DK", {
    day: "numeric", month: "long", timeZone: "Europe/Copenhagen",
  });
}

/**
 * "1.200.000 kr." — kun når beløbet FAKTISK står på opgaven.
 *
 * ⚠️ Valutaen vises kun hvis den ikke er DKK. Alle opgaver er dansk-filtrerede,
 * så "kr." er rigtigt i praksis — men står der EUR på rækken, skal det stå på
 * skærmen, ikke laves om til kroner med en kurs vi ikke har.
 */
function fmtBeloeb(beloeb, valuta) {
  if (typeof beloeb !== "number" || !isFinite(beloeb) || beloeb <= 0) return null;
  const tal = Math.round(beloeb).toLocaleString("da-DK");
  const v = (valuta || "DKK").toUpperCase();
  return v === "DKK" ? `${tal} kr.` : `${tal} ${v}`;
}

export default function OpgaveKort({ opgave, omraade = null }) {
  if (!opgave?.titel) return null;
  const frist = fmtFrist(opgave.frist);
  const beloeb = fmtBeloeb(opgave.beloeb, opgave.valuta);
  // ⚠️ OMRÅDET KOMMER FRA KUNDENS EGET VALG, ikke fra opgaven. I funnelen har
  // hun valgt en landsdel, og matchet ER filtreret på den — så det er sandt at
  // skrive den. På forsiden er der ikke valgt noget (vi søger hele landet), og
  // dér sendes `omraade` ikke med, så linjen udgår. Vi udleder ALDRIG et sted
  // ud af opgaven selv: NUTS-koderne følger bevidst ikke med ud.
  const sted = opgave.landsdaekkende ? "Hele landet" : omraade;

  return (
    <article className="sg-opgave">
      <span className="sg-opgave-badge">Offentlig opgave</span>
      <h3 className="sg-opgave-titel">{opgave.titel}</h3>
      {opgave.koeber && <div className="sg-opgave-koeber">{opgave.koeber}</div>}
      <dl className="sg-opgave-meta">
        {sted && (
          <div><dt>Område</dt><dd>{sted}</dd></div>
        )}
        {frist && (
          <div><dt>Frist</dt><dd>{frist}</dd></div>
        )}
        {beloeb && (
          <div><dt>Værdi</dt><dd>{beloeb}</dd></div>
        )}
      </dl>
    </article>
  );
}
