// GET /api/cvr?cvr=12345678 — slå en dansk virksomhed op (firmanavn + branchekode).
//
// Server-side proxy mod cvrapi.dk (gratis, offentligt, ingen nøgle). Holdes
// server-side så vi sætter en pæn User-Agent og ikke afslører kald-mønster i
// klienten. Branchekoden normaliseres til 6-cifret uden punktum — samme format
// som branchekode_fag_map, så fag-gættet kan slå op.

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cvr = (searchParams.get("cvr") || "").replace(/\D/g, "");
  if (cvr.length !== 8) {
    return Response.json({ found: false, error: "CVR skal være 8 cifre." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://cvrapi.dk/api?search=${cvr}&country=dk`, {
      headers: { "User-Agent": "Birdly/1.0 (+https://birdly.dk; hello@birdly.dk)" },
      // CVR-data ændrer sig sjældent; lad Next cache kortvarigt.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return Response.json({ found: false }, { status: 200 });
    }
    const d = await res.json();
    if (!d || d.error || !d.name) {
      return Response.json({ found: false }, { status: 200 });
    }

    // industrycode = DB07-branchekode (6 cifre). Normalisér til kun cifre.
    const branchekode = String(d.industrycode || "").replace(/\D/g, "") || null;

    return Response.json({
      found: true,
      name: d.name || null,
      branchekode,
      industridesc: d.industrydesc || null,
      address: d.address || null,
      zipcode: d.zipcode ? String(d.zipcode) : null,
      city: d.city || null,
    });
  } catch (err) {
    // Net-/parsefejl: lad kunden taste manuelt — bloker ikke flowet.
    return Response.json({ found: false, error: "lookup_failed" }, { status: 200 });
  }
}
