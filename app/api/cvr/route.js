// GET /api/cvr?cvr=12345678 — slå en dansk virksomhed op (firmanavn + branchekode).
//
// Server-side proxy mod cvrapi.dk (gratis, offentligt, ingen nøgle). Holdes
// server-side så vi sætter en pæn User-Agent og ikke afslører kald-mønster i
// klienten. Branchekoden normaliseres til 6-cifret uden punktum — samme format
// som branchekode_fag_map, så fag-gættet kan slå op.

import { after } from "next/server";

export const runtime = "nodejs";

// ⚠️ TO SLAGS SVAR, TO SLAGS CACHE. Et rigtigt svar fra registeret — baade
// "findes" og "findes ikke" — er en oplysning om virksomheden og maa gerne
// genbruges. Alt andet ("lookup_failed") er en oplysning om VORES infrastruktur
// og maa aldrig blive staaende. Headeren saettes derfor efter udfaldet, hvor vi
// VED hvad vi har, frem for paa kaldet hvor vi ikke goer.
//
// ⚠️ "findes ikke" udloeber hurtigere end "findes". En virksomhed kan blive
// stiftet i morgen; en eksisterende forsvinder sjaeldent fra den ene dag til den
// anden. Samme asymmetri som cvr_opslag-cachen i admin (0119).
const SVAR_CACHE = { found: "public, s-maxage=86400, stale-while-revalidate=86400",
                     not_found: "public, s-maxage=3600" };
function svar(body, cacheNoegle) {
  return Response.json(body, {
    status: 200,
    headers: { "Cache-Control": cacheNoegle ? SVAR_CACHE[cacheNoegle] : "no-store" },
  });
}


// ⚠️ CACHE-SKRIVNINGEN: DEN RUNTIME DER KAN NÅ REGISTERET, AFLEVERER SVARET
// (01-10-2026).
//
// `signup` i birdly-admin slår CVR op fra SUPABASES udgående IP og rammer
// `QUOTA_EXCEEDED` hver gang — cvrapi måler pr. IP-range, og Supabase deler
// sine adresser med fremmede. Vercels IP virker (målt 3/3). Konsekvensen var at
// cachen stod frossen siden 08-09, at hver tilmelding siden 16-09 fik
// `cvr_opslag: "usikker"`, og at fakturaerne derfor manglede momsnummer OG
// adresse.
//
// Denne rute kaldes fra funnelen og lykkes. Derfor afleverer den nu sit svar
// til den cache `signup` allerede læser, FØR kunden når betalingstrinnet.
//
// ⚠️ DEN MÅ ALDRIG FORSINKE ELLER VÆLTE SVARET TIL KUNDEN. Ingen `await` i
// svarets vej, ingen fejl der bobler op. Lykkes skrivningen ikke, får kunden
// præcis det samme svar som før — hun mærker intet.
//
// ⚠️ HEMMELIGHEDEN ER SERVER-SIDE. `CVR_CACHE_SECRET` må ALDRIG hedde
// `NEXT_PUBLIC_*`; denne fil er en route handler og kører kun på serveren.
// Mangler variablen, springes skrivningen over i stilhed — det er den rigtige
// opførsel i preview og lokalt, hvor cachen ikke skal fodres.
// ⚠️ ANON-NØGLEN SKAL MED, OG DET ER BÆLTE-OG-SELER (01-10-2026).
// Supabases gateway kan kræve en JWT før kaldet overhovedet når funktionen.
// `cvr-opslag` kører i dag med `verify_jwt = false` — bevist ved at et POST
// uden nøgle når frem til koden — men den indstilling blev sat i dashboardet og
// stod ikke i repoets config.toml. Et fremtidigt deploy kunne slå kravet til.
//
// Og det værste: skrivningen her er fire-and-forget, så et 401 fra gatewayen
// ville blive slugt i stilhed. Fase 3 ville se deployet ud og gøre INGENTING.
// Nøglen er offentlig (den ligger i enhver browser), så den koster os intet at
// sende — og den fjerner en hel klasse af tavs fejl.
//
// ⚠️ DEN ER IKKE AUTENTIFIKATIONEN. Adgangen afgøres af `x-cvr-cache-secret`,
// som valideres i funktionen. Anon-nøglen får os bare gennem døren.
// ⚠️⚠️ `void fetch(...)` VIRKEDE IKKE, OG DET BLEV FANGET I PRODUKTION
// (02-10-2026). Det var min fejl, og den er værd at forstå:
//
// Første udgave affyrede kaldet uden at afvente det, netop for ikke at
// forsinke kunden. I en serverless-runtime er det forkert: Vercel fryser
// instansen i det øjeblik svaret er sendt, og en promise ingen venter på bliver
// aldrig færdig. Resultatet var det værst tænkelige — koden deployet, alle
// vagter grønne, `/api/cvr` svarede korrekt, og cachen rykkede sig ikke en
// millimeter. Målt: 5 rækker før, 5 rækker efter, intet skrevet.
//
// Præcis den fejlklasse huset er dyrest ramt af: en ændring der består enhver
// stikprøve og ikke gør noget. Og den kunne KUN fanges af et produktionsopslag,
// ikke af en test.
//
// `after()` fra next/server er det rigtige værktøj: arbejdet planlægges til
// EFTER svaret er sendt, og platformen holder instansen i live til det er
// færdigt. Kunden venter stadig ikke — men skrivningen sker.
function gemICache(cvr, svarKrop) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.CVR_CACHE_SECRET;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !secret) return "sprunget_over:ingen_konfiguration";
  // Kun DEFINITIVE svar. `lookup_failed` siger noget om vores infrastruktur,
  // ikke om virksomheden, og hører ikke i en cache.
  if (svarKrop.reason !== "found" && svarKrop.reason !== "not_found") return "sprunget_over:ikke_definitivt";
  try {
    // ⚠️ await INDE I after() ER IKKE EN VENTETID FOR KUNDEN. Svaret er allerede
    // sendt; her venter vi kun på at vores egen skrivning bliver færdig, så en
    // fejl faktisk kan logges i stedet for at forsvinde.
    after(async () => {
      try {
        const r = await fetch(`${base}/functions/v1/cvr-opslag`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cvr-cache-secret": secret,
            ...(anon ? { apikey: anon, Authorization: `Bearer ${anon}` } : {}),
          },
          body: JSON.stringify({
            cvr,
            findes: svarKrop.found === true,
            navn: svarKrop.name || null,
            branchekode: svarKrop.branchekode || null,
            adresse: svarKrop.address || null,
            postnummer: svarKrop.zipcode || null,
            by: svarKrop.city || null,
            market_id: "DK",
          }),
        });
        // ⚠️ STATUSKODEN LOGGES UANSET UDFALD. En tavs afvisning er grunden til
        // at den første udgave kunne se ud som om den virkede.
        if (!r.ok) {
          console.warn("[api/cvr] cache-skrivning afvist:", r.status, (await r.text().catch(() => "")).slice(0, 120));
        } else {
          console.log("[api/cvr] cache-skrivning ok:", cvr, r.status);
        }
      } catch (e) {
        console.warn("[api/cvr] cache-skrivning fejlede:", e?.message || e);
      }
    });
    return "planlagt";
  } catch (e) {
    console.warn("[api/cvr] cache-skrivning kunne ikke planlaegges:", e?.message || e);
    return "sprunget_over:fejl";
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cvr = (searchParams.get("cvr") || "").replace(/\D/g, "");
  if (cvr.length !== 8) {
    return Response.json({ found: false, error: "CVR skal være 8 cifre." }, { status: 400 });
  }

  try {
    // ⚠️ FEJL CACHES IKKE — KUN SVAR (16-09-2026).
    //
    // Her stod `next: { revalidate: 3600 }`. Den cacher det UPSTREAM kald, og
    // Next kan ikke se forskel på et svar og en fejl: et `QUOTA_EXCEEDED` blev
    // gemt og genbrugt i en time. Registeret kunne altså være tilbage efter to
    // minutter, mens vi blev ved med at svare kunden "vi kunne ikke slå op" —
    // og en tilmelding der bliver bremset af vores egen cache, er den værste
    // slags: alt ser ud til at virke, og ingen fejl bliver logget.
    //
    // ⚠️ KVOTEN GØR DET SKARPERE, IKKE MILDERE. cvrapi giver 50 gratis opslag
    // pr. dag pr. IP, og et overskredet loft spærrer IP'en "typisk indtil næste
    // dag". Netop dér er en cache mest værd — og netop dér gjorde den skade,
    // fordi den forlængede spærringen i stedet for at spare på den.
    //
    // Kaldet gemmes derfor aldrig. Til gengæld sættes der cache-headere på
    // VORES svar længere nede, hvor vi VED om det var et svar eller en fejl.
    const res = await fetch(`https://cvrapi.dk/api?search=${cvr}&country=dk`, {
      headers: { "User-Agent": "Birdly/1.0 (+https://birdly.dk; hello@birdly.dk)" },
      cache: "no-store",
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
      const krop = { found: false, reason: "not_found" };
      krop.cache_write = gemICache(cvr, krop);
      return svar(krop, "not_found");
    }
    if (!res.ok) {
      return svar({ found: false, reason: "lookup_failed" }, null);
    }
    if (!d) {
      return svar({ found: false, reason: "lookup_failed" }, null);
    }
    if (d.error === "NOT_FOUND") {
      const krop = { found: false, reason: "not_found" };
      krop.cache_write = gemICache(cvr, krop);
      return svar(krop, "not_found");
    }
    if (d.error || !d.name) {
      // Alle andre fejlkoder (fx QUOTA_EXCEEDED) er VORES problem, ikke kundens.
      return svar({ found: false, reason: "lookup_failed" }, null);
    }

    // industrycode = DB07-branchekode (6 cifre). Normalisér til kun cifre.
    const branchekode = String(d.industrycode || "").replace(/\D/g, "") || null;

    const krop = {
      found: true,
      reason: "found",
      name: d.name || null,
      branchekode,
      industridesc: d.industrydesc || null,
      address: d.address || null,
      zipcode: d.zipcode ? String(d.zipcode) : null,
      city: d.city || null,
    };
    // ⚠️ UDFALDET LAEGGES I SVARET, saa kaeden kan AFLAESES udefra frem for at
    // skulle udledes. Den foerste udgave var tavs, og netop tavsheden var
    // grunden til at et no-op kunne se ud som en succes. Feltet afsloerer
    // intet: ingen hemmelighed, ingen kundedata — kun om VI planlagde en
    // skrivning. Samme raesonnement som /api/version.
    krop.cache_write = gemICache(cvr, krop);
    return svar(krop, "found");
  } catch (err) {
    // Net-/parsefejl: lad kunden taste manuelt — bloker ikke flowet.
    return svar({ found: false, reason: "lookup_failed", error: "lookup_failed" }, null);
  }
}
