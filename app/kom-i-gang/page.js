import Salgsside from "../../components/salg/Salgsside";
import { hentOpgaveTal } from "../../lib/opgaveTal";
import { medQuery } from "../../lib/funnelLink";

// /kom-i-gang — SALGSSIDEN. Funnelens indgang og Meta-annoncernes landingsside.
//
//   annonce / husets CTA / de 36 /fag/-sider  →  DENNE side  →  /start  →  betaling
//
// ⚠️ ADRESSEN SKAL VÆRE STABIL. Den står i annoncer, og en annonce der peger på
// en død URL er spildte penge. /tilmeld og /ny omdirigerer permanent hertil.
//
// ⚠️ NOINDEX — OG DET ER EN BESLUTNING, IKKE EN FORGLEMMELSE.
// Siden sælger det SAMME til den SAMME søgende som roden. Var begge
// indekserbare, ville vi selv sætte dem op mod hinanden på de søgeord roden
// lever af. Den skal ikke rangere; den skal konvertere betalt trafik.
//
// ⚠️ SAMME COPY SOM RODEN, ÉN KILDE. Sektionerne kommer fra
// components/salg/Sektioner.js, som forsiden også bruger. Forskellen mellem de
// to sider er hvad der ligger UNDER dem: roden har hele SEO-laget (de tolv
// FAQ-svar, forklaringssektionerne, FAQPage-schemaet), denne har ingenting.
// Skrev vi to sæt tekst, ville en besøgende fra Google og en fra Facebook få
// hvert sit løfte om det samme produkt.
export const metadata = {
  title: "Kom i gang med Birdly",
  description:
    "Fortæl os hvad I laver, og hvor. Så holder vi øje med de offentlige og private opgaver, der passer til jer, og sender besked på SMS.",
  robots: { index: false, follow: true },
};

// ?fag= / ?region= sættes af de 36 /fag/-siders CTA. ?utm_* / ?fbclid / ?angle
// kommer fra annoncerne.
//
// ⚠️ ALT DET FØRES VIDERE TIL /start — se lib/funnelLink.js. Forvalget skal
// overleve hele kæden, ellers taber en besøgende fra "Entreprenøropgaver i
// Nordjylland" sit fag ét skridt før mål. Salgssiden validerer ikke værdierne;
// det gør /start mod kataloget, så der kun findes ÉT sted hvor de bliver troet på.
//
// ⚠️ UTM'erne fanges OGSÅ af lib/attribution.js ved landing (sessionStorage), så
// målingen overlever selv hvis nogen deler et nøgent link videre. Begge veje er
// med vilje: sessionStorage kan fejle i privat browsing, og en adresselinje man
// kan se er lettere at fejlsøge.
export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const raaFag = Array.isArray(sp.fag) ? sp.fag[0] : sp.fag;
  const tal = await hentOpgaveTal();
  return <Salgsside tal={tal} funnelHref={medQuery("/start", sp)} fag={raaFag || null} />;
}
