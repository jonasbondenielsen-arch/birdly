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
    const d = await res.json().catch(() => null);

    // ⚠️ TRE UDFALD, IKKE TO (04-09-2026). Her stod foer `found: false` for BAADE
    // "virksomheden findes ikke" og "vi kunne ikke faa fat i registeret". De to skal
    // behandles modsat: det foerste skal stoppe kunden, det andet maa ALDRIG goere det.
    // Sammenblandingen var grunden til at signup-gaten ikke kunne genbruge denne rute.
    //
    // Maalt paa rigtige numre: gyldigt CVR = 200 + data, ugyldigt = 404 + NOT_FOUND,
    // for mange kald = QUOTA_EXCEEDED.
    if (res.status === 404 && d?.error === "NOT_FOUND") {
      return Response.json({ found: false, reason: "not_found" }, { status: 200 });
    }
    if (!res.ok) {
      return Response.json({ found: false, reason: "lookup_failed" }, { status: 200 });
    }
    if (!d) {
      return Response.json({ found: false, reason: "lookup_failed" }, { status: 200 });
    }
    if (d.error === "NOT_FOUND") {
      return Response.json({ found: false, reason: "not_found" }, { status: 200 });
    }
    if (d.error || !d.name) {
      // Alle andre fejlkoder (fx QUOTA_EXCEEDED) er VORES problem, ikke kundens.
      return Response.json({ found: false, reason: "lookup_failed" }, { status: 200 });
    }

    // industrycode = DB07-branchekode (6 cifre). Normalisér til kun cifre.
    const branchekode = String(d.industrycode || "").replace(/\D/g, "") || null;

    return Response.json({
      found: true,
      reason: "found",
      name: d.name || null,
      branchekode,
      industridesc: d.industrydesc || null,
      address: d.address || null,
      zipcode: d.zipcode ? String(d.zipcode) : null,
      city: d.city || null,
    });
  } catch (err) {
    // Net-/parsefejl: lad kunden taste manuelt — bloker ikke flowet.
    return Response.json({ found: false, reason: "lookup_failed", error: "lookup_failed" }, { status: 200 });
  }
}
