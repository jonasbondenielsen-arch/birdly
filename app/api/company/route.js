// GET /api/company?number=12345678 — slå et britisk selskab op i Companies House.
//
// ⚠️ SPEJLER /api/cvr'S ASYMMETRISKE GATE, OG DET ER HELE POINTEN.
// Tre udfald, ikke to:
//   found        → selskabet findes; funnelen kan fortsætte
//   not_found    → nummeret findes ikke; kunden skal stoppes
//   lookup_failed→ VI kunne ikke få fat i registeret; det må ALDRIG stoppe kunden
// Sammenblandingen af de to sidste var netop grunden til at DK's gate måtte
// skrives om 04-09-2026. Den fejl gentages ikke her.
//
// ⚠️ VERIFICERET MOD OFFICIEL GOV.UK-DOKUMENTATION 08-09-2026:
//   · endpoint  GET https://api.company-information.service.gov.uk/company/{number}
//   · auth      HTTP Basic — API-nøglen som BRUGERNAVN, tomt kodeord
//   · 404       "Resource not found" når nummeret ikke findes
//   · 401       manglende/ugyldig nøgle
//   · rate      600 kald pr. 5 minutter, derefter 429 resten af vinduet
//   Målt: endpointet svarer 401 uden nøgle, altså er vært og sti rigtige.
//
// ⚠️ FELTMAPNINGEN ER ENDNU IKKE BEVIST MOD ÆGTE DATA. Der findes ingen
// API-nøgle endnu (Jonas opretter den), så svarets form er læst i
// dokumentationen — ikke målt. Præcis dét var fælden i Find a Tender, hvor
// CPV lå et andet sted end specifikationen antydede, og en adapter der "virkede"
// ville have givet nul matchbare udbud. Første rigtige opslag skal derfor
// verificeres felt for felt, før gaten må stole på den.

export const runtime = "nodejs";

const BASE = "https://api.company-information.service.gov.uk";

/**
 * Normaliserer et britisk firmanummer.
 *
 * ⚠️ DET ER IKKE OTTE CIFRE. Engelske og walisiske selskaber har otte cifre,
 * men skotske hedder SC123456, nordirske NI/R0..., og LLP'er OC/SO/NC. En
 * "kun cifre"-validering som DK's ville lukke hele Skotland og Nordirland ude.
 *
 * ⚠️ RENE TAL NUL-PADDES. Companies House skriver "00000006", men folk taster
 * "6". Uden padding ville et gyldigt nummer se ud som om det ikke fandtes —
 * altså den ene fejl gaten aldrig må lave.
 */
export function normaliserFirmanummer(raa) {
  const s = String(raa || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!s) return null;
  if (/^\d+$/.test(s)) return s.length <= 8 ? s.padStart(8, "0") : null;
  return /^[A-Z]{2}\d{6}$/.test(s) ? s : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nummer = normaliserFirmanummer(searchParams.get("number"));
  if (!nummer) {
    return Response.json(
      { found: false, reason: "invalid", error: "Enter a valid company number." },
      { status: 400 },
    );
  }

  const noegle = process.env.COMPANIES_HOUSE_API_KEY;
  if (!noegle) {
    // ⚠️ FEJLER ÅBENT, IKKE LUKKET. Uden nøgle er det OS der mangler noget, og
    // en manglende konfiguration må ikke se ud som en kunde der ikke findes.
    // `unconfigured` skelnes fra `lookup_failed`, så en glemt nøgle kan SES i
    // stedet for at gemme sig som en netværksfejl.
    return Response.json({ found: false, reason: "lookup_failed", detail: "unconfigured" }, { status: 200 });
  }

  try {
    const res = await fetch(`${BASE}/company/${encodeURIComponent(nummer)}`, {
      headers: {
        // Basic med nøglen som brugernavn og tomt kodeord (officiel dok).
        Authorization: "Basic " + Buffer.from(`${noegle}:`).toString("base64"),
        Accept: "application/json",
        "User-Agent": "Birdly/1.0 (+https://getbirdly.co.uk; hello@getbirdly.co.uk)",
      },
      // Selskabsdata ændrer sig sjældent; samme kortvarige cache som DK.
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      return Response.json({ found: false, reason: "not_found" }, { status: 200 });
    }
    // ⚠️ 401 og 429 er VORES problem, ikke kundens. En opbrugt kvote må ikke
    // kunne spærre en rigtig virksomhed ude midt i en tilmelding.
    if (!res.ok) {
      return Response.json({ found: false, reason: "lookup_failed", detail: String(res.status) }, { status: 200 });
    }

    const d = await res.json().catch(() => null);
    if (!d || !d.company_name) {
      return Response.json({ found: false, reason: "lookup_failed", detail: "tomt_svar" }, { status: 200 });
    }

    const a = d.registered_office_address || {};
    return Response.json({
      found: true,
      reason: "found",
      number: d.company_number || nummer,
      name: d.company_name,
      // ⚠️ STATUS RETURNERES, MEN BLOKERER IKKE HER. Et opløst selskab kan ikke
      // vinde en kontrakt, men "må en dissolved virksomhed tilmelde sig" er en
      // produktbeslutning, ikke en opslagsdetalje. Gaten i funnelen tager den —
      // ét sted, som DK's.
      status: d.company_status || null,
      type: d.type || null,
      // ⚠️ SIC-KODER RETURNERES RÅT. Der findes INGEN SIC→fag-tabel endnu, og
      // jeg opfinder den ikke: DK's branchekode_fag_map er bygget på koder der
      // er SET returneret af ægte opslag, og den regel gælder også her. Indtil
      // en britisk mapping findes, vælger kunden selv sit fag — samme vej som
      // sole traders. Se noten i funnelen.
      sic_codes: Array.isArray(d.sic_codes) ? d.sic_codes : [],
      postcode: a.postal_code || null,
      locality: a.locality || null,
      created: d.date_of_creation || null,
    });
  } catch {
    // Net-/parsefejl: lad kunden fortsætte. Aldrig blokér på vores fejl.
    return Response.json({ found: false, reason: "lookup_failed", detail: "netvaerk" }, { status: 200 });
  }
}
