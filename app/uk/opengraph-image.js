import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// ============================================================================
// DET BRITISKE DELEBILLEDE — 1200×630, next/og, Next's opengraph-image-konvention.
//
// ⚠️ DEN FINDES FORDI OPEN GRAPH VIRKER UANSET noindex. GB er DRAFT og bliver
// ikke indekseret — men et link der deles i en mail, en DM eller en LinkedIn-
// tråd henter stadig OG-tagget. Indtil nu havde /uk INGEN `images`, med den
// helt rigtige begrundelse at det danske billede har dansk tekst brændt ind.
// Konsekvensen var bare at et delt britisk link enten viste ingenting eller
// hvad platformen selv kunne finde. Det her er det manglende alternativ.
//
// ⚠️ INTET TAL, INGEN PÅSTAND OM VOLUMEN. Samme regel som det danske kort:
// et PNG caches hos Facebook og LinkedIn i dagevis efter et vilkår er ændret,
// og der findes ingen deploy der kan hente det hjem igen. Derfor står hverken
// prøvelængde, pris eller opgavetal her — kun det der ikke ændrer sig.
//
// ⚠️ en-GB, IKKE en-US, og "straight to your phone" frem for "SMS" — samme
// sprogregler som lib/tekster/en.js. Teksten er copy-filens hero, forkortet
// til et kort, ikke en ny formulering.
//
// ⚠️ INGEN ".dk" I ORDMÆRKET. Det danske kort skriver "Birdly.dk"; gør vi det
// samme her, fortæller vi en britisk læser at hun er på et dansk site, i det
// ene sekund hun kigger. Domænet i bunden er getbirdly.co.uk.
// ============================================================================

export const runtime = "nodejs";
export const alt = "Birdly — cleaning and service contracts, straight to your phone";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function UkOpengraphImage() {
  // Samme fugle-mærke som det danske kort. Satori kan ikke hente relative
  // URL'er, så filen læses fra disken og indlejres som data-URL.
  const bird = await readFile(join(process.cwd(), "app", "apple-icon.png"));
  const birdSrc = `data:image/png;base64,${bird.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background: "linear-gradient(135deg, #0D1B2A 0%, #143049 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand-række */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "92px",
              height: "92px",
              borderRadius: "22px",
              background: "#fff",
              marginRight: "22px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={birdSrc} alt="Birdly" width={68} height={68} />
          </div>
          <div style={{ display: "flex", fontSize: "42px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span>Birdly</span>
          </div>
        </div>

        {/* Hovedbudskab */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "70px", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Cleaning contracts.
          </div>
          <div style={{ display: "flex", fontSize: "70px", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            <span>Straight to your&nbsp;</span>
            <span style={{ color: "#2EB7FF" }}>phone.</span>
          </div>
          <div style={{ marginTop: "26px", fontSize: "31px", color: "#C3D2E4", maxWidth: "880px", lineHeight: 1.35 }}>
            Birdly watches public contract notices across the UK and tells you when one fits your business.
          </div>
        </div>

        {/* Bund-række */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              padding: "14px 28px",
              borderRadius: "999px",
              background: "#00B3A6",
              color: "#fff",
              fontSize: "27px",
              fontWeight: 700,
            }}
          >
            Free trial · no lock-in
          </div>
          <div style={{ display: "flex", fontSize: "29px", fontWeight: 700, color: "#7FD0FF" }}>getbirdly.co.uk</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
