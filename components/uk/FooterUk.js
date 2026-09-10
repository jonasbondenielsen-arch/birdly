import Link from "next/link";
import { BirdMark } from "./../Logo";
import { UK_BASE } from "./../../lib/uk/jura";
import "./../../app/footer.css";

// ============================================================================
// DEN BRITISKE FOOTER — EGEN FIL, OG DET ER MÅLT.
//
// ⚠️ DEN LÅ FØR SOM EN GREN I components/Footer.js. Det virkede, lige
// indtil jura-hub'en også skulle have en footer: en NY IMPORTØR af Footer
// ændrede Turbopacks chunk-gruppering og skilte SamtykkeLink ud som sin egen
// 331-byte chunk — altså et ekstra <script> på /priser og /sadan-virker-det.
// Målt ved isolation 10-09-2026: fjern hub'ens Footer-import, og DK er 8/8.
//
// Footer importerer SamtykkeLink, og den knap er dansk. En britisk side har
// intet brug for den. De to footere er derfor adskilt: DK's ligger urørt i
// components/Footer.js, UK's her — uden koblingen.
//
// ⚠️ SAMME KLASSER SOM DK's. Hele footer.css er scopet under
// `.birdly-footer`, så den britiske footer får den danske styling gratis:
// flinks → fdiv → fbottom (fleft / fjur / fcompany / fsocial). Struktur fra
// DK, indhold fra copy-filen og jura-pakken.
// ============================================================================
export default function FooterUk({ supportMail, ord }) {
  if (!ord) return null;
  return (
    <footer className="birdly-footer">
      <div className="finner">
        <nav className="flinks">
          {ord.punkter.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>

        <div className="fdiv" />

        <div className="fbottom">
          <div className="fleft">
            {/* ⚠️ "Birdly", IKKE "Birdly.dk" - copy-filen §27. Den danske
                footer saetter ".dk" i sit eget span; her er der ingen. */}
            <Link href={UK_BASE} className="fmark" aria-label={ord.brand}>
              <BirdMark size={30} />
              <span>{ord.brand}</span>
            </Link>
            {/* ⚠️ EET LINK, IKKE TI. Den danske footer har ogsaa kun
                eet (/betingelser); hub'en linker videre. Ti jura-links i
                footeren ville drukne de fire der handler om produktet.
                ⚠️ SIDERNE ER DRAFT + noindex - se JuraSide.js. */}
            {ord.juraHref && (
              <div className="fjur">
                <b>{ord.juraTitel}</b>
                <Link href={ord.juraHref}>{ord.juraLink}</Link>
                {/* ⚠️ JURA-PAKKENS NOTE 11 KRAEVER AT DEN ER SYNLIG.
                    Et link begravet inde i Private Job Terms er ikke synligt;
                    footeren staar paa hver side. */}
                {ord.rapporterHref && (
                  <Link href={ord.rapporterHref}>{ord.rapporter}</Link>
                )}
                {/* DK's jura-blok har ogsaa samtykke-linket. Her er det et
                    LINK til politikken frem for DK's knap: knappen bor i
                    SamtykkeLink, som er dansk - og hele pointen med den her
                    fil er at UK ikke haenger paa den. Cookie-politikkens §3
                    forklarer selv hvordan man aabner Cookie Settings igen. */}
                {ord.cookieHref && (
                  <Link href={ord.cookieHref}>{ord.cookieValg}</Link>
                )}
              </div>
            )}
          </div>

          {/* ⚠️ JURIDISK LINJE, IKKE MARKETING. Den maa aldrig antyde et
              britisk selskab - copy-filen: "Do not show the Danish
              CVR/address blindly as if it is a UK company." */}
          <div className="fcompany">
            {ord.firma}<br />
            <a href={`mailto:${supportMail}`}>{supportMail}</a>
          </div>

          {/* ⚠️ INGEN SOCIALE IKONER PAA UK - endnu.
              DK's footer viser Facebook/Instagram naar adresserne er sat i
              env. De konti er DANSKE: en britisk besoegende ville klikke sig
              til en dansksproget side. Ikke et doedt link, men heller ikke
              rigtigt. Naar Jonas har britiske konti - eller beslutter at de
              danske skal deles - er det den her blok der mangler. */}
        </div>
      </div>
    </footer>
  );

}
