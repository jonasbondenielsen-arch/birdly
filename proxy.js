import { NextResponse } from "next/server";
import { markedForHostMedOverride, STANDARD_MARKED, MARKEDER, primaerHost } from "./lib/markets";

// ============================================================================
// HVILKET MARKED ER DENNE REQUEST? (multimarket Fase 6, 08-09-2026)
//
// ⚠️ FILEN HEDDER proxy.js, IKKE middleware.js. Next 16 har omdoebt
// konventionen, og byggeriet advarer eksplicit om den gamle. birdly-admin
// bruger allerede proxy.js — de to repos skal ikke staa med hver sin.
//
// ⚠️ DEN SÆTTER ÉN HEADER OG GØR ELLERS INTET. Ingen redirect, ingen rewrite,
// ingen omskrivning af svaret. Proxy kører på hver request, så alt andet
// end det billigst mulige ville koste på hver eneste sidevisning — også de
// danske, som er de eneste der findes i dag.
//
// ⚠️ HVORFOR EN HEADER OG IKKE ET OPSLAG I HVER SIDE. Værten kendes kun på
// request-tidspunktet. Skulle hver side selv læse `headers()`, ville den blive
// dynamisk — og de statiske sider (forside, fag-sider, viden) ville miste deres
// cache. Med headeren sat her kan de sider der FAKTISK har brug for markedet
// læse den, og resten kan blive stående som statiske.
//
// ⚠️ DEN ÆNDRER INGENTING I DAG. `markedForHost` kender kun birdly.dk og
// www.birdly.dk som aktive; GB er `aktiv: false` i lib/markets.js. Headeren
// siger derfor "DK" på hver request, og ingen læser den endnu. Den er sat op
// nu, så den dag getbirdly.co.uk peges hertil, er der ét sted at slå
// markedet op — ikke en `if (host === ...)` spredt i komponenterne.
//
// ⚠️ UKENDT VÆRT GIVER STANDARD_MARKED. Det er en bevidst fail-open MENS der
// kun serveres ét marked: en preview-URL på vercel.app skal opføre sig som
// birdly.dk. NÅR GB GÅR I LUFTEN skal en ukendt vært give 404 i stedet —
// ellers serveres dansk indhold under en adresse ingen har godkendt.
// ============================================================================

export const MARKED_HEADER = "x-birdly-marked";

export function proxy(request) {
  // ⚠️ OVERRIDEN GAELDER KUN NAAR VAERTEN ER UKENDT (se markets.js). Den
  // saettes paa preview-deploymentet, saa UK-sitet kan ses foer DNS peges - og
  // den kan ALDRIG flytte www.birdly.dk, fordi en kendt vaert altid vinder.
  const fundet = markedForHostMedOverride(
    request.headers.get("host"),
    process.env.NEXT_PUBLIC_FORCE_MARKED,
  );
  const marked = fundet?.id || STANDARD_MARKED;

  // ══ 301: ALTERNATIVE DOMAENER → MARKEDETS PRIMAERE ══
  //
  // ⚠️ DEN SKAL LIGGE FOER REWRITE'EN. getbirdly.uk er et KENDT
  // GB-vaertsnavn, saa uden det her ville proxy'en opfatte den som markedets
  // adresse og servere hele sitet paa den — maalt 10-09-2026: HTTP 200 paa
  // baade .uk og .co.uk med samme indhold. To adresser med samme side er
  // duplikeret indhold, og et canonical-tag er en henstilling, ikke en
  // omdirigering.
  //
  // ⚠️ 301, IKKE 302. Adressen flytter permanent; en midlertidig
  // omdirigering ville lade soegemaskiner beholde .uk som den kanoniske.
  //
  // ⚠️ DANMARK HAR INGEN SAADANNE DOMAENER. Ingen DK-vaert baerer
  // `viderestil`, saa den her gren fyrer aldrig paa birdly.dk.
  const vaert = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const domaene = MARKEDER[marked]?.domaener?.find((d) => d.host === vaert);
  if (domaene?.viderestil) {
    const maal = request.nextUrl.clone();
    maal.protocol = "https:";
    maal.host = primaerHost(marked);
    maal.port = "";
    return NextResponse.redirect(maal, 301);
  }

  const headers = new Headers(request.headers);
  headers.set(MARKED_HEADER, marked);

  // ── REWRITE TIL MARKEDETS EGET TRAE ────────────────────────────────────────
  // ⚠️ HER STOD "DEN SAETTER EEN HEADER OG GOER ELLERS INTET". Det gjaldt saa
  // laenge der kun fandtes eet site. Nu findes det engelske, og valget stod
  // mellem to onder:
  //   (a) lade `/` laese headers() og vaelge marked pr. request - hvilket ville
  //       goere DEN DANSKE forside dynamisk og koste dens cache
  //   (b) rewrite britiske vaerter til et eget statisk trae under /uk
  // (b) vinder, fordi den danske renderingssti saa er BOGSTAVELIGT UROERT -
  // og det er dét der goer DK bevisligt byte-identisk.
  //
  // ⚠️ ADRESSEN AENDRER SIG IKKE FOR BRUGEREN. Et rewrite er internt; en
  // redirect ville have vist /uk i adresselinjen og gjort det til en anden side.
  //
  // ⚠️ KUN NAAR MARKEDET IKKE ER STANDARD. Er svaret DK, roeres ruten ikke med
  // eet tegn - saa kan et uheld her ikke ramme Danmark.
  if (marked !== STANDARD_MARKED) {
    const sti = request.nextUrl.pathname;
    // ⚠️ PRAEFIKSET LAESES, DET GAETTES IKKE. Det stod som
    // `"/" + marked.toLowerCase()`, altsaa "/gb" for markedet GB - men de
    // britiske sider ligger i app/uk/. Hver side paa getbirdly.co.uk ville
    // have svaret 404. `sti` i lib/markets.js siger det nu eksplicit, og
    // id'et bruges kun som fallback for markeder hvor de to er ens.
    const praefiks = "/" + (fundet?.sti || marked.toLowerCase());
    if (!sti.startsWith(praefiks)) {
      const url = request.nextUrl.clone();
      url.pathname = praefiks + (sti === "/" ? "" : sti);
      return NextResponse.rewrite(url, { request: { headers } });
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  // ⚠️ STATISKE FILER OG BILLED-OPTIMERING ER UDE. Middleware på et ikon eller
  // en font er ren spildt latency — de har ingen markeds-kontekst.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
