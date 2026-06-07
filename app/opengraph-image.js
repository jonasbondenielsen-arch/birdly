import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Delebillede (Facebook/LinkedIn/X) — genereres 1200×630 af next/og efter
// Next.js' opengraph-image-konvention. Next tilføjer automatisk og:image +
// twitter:image på alle sider. Brand-navy baggrund + fugle-mærket fra logo-
// pakken i et hvidt badge. Kun metadata/SEO — intet synligt sideindhold.

export const runtime = "nodejs";
export const alt = "Birdly — offentlige opgaver direkte på SMS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Læs fugle-mærket og indlejr som data-URL (Satori kan ikke hente relative URL'er).
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
            <span style={{ color: "#2EB7FF" }}>.dk</span>
          </div>
        </div>

        {/* Hovedbudskab */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "74px", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Offentlige opgaver.
          </div>
          <div style={{ display: "flex", fontSize: "74px", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            <span>Direkte på&nbsp;</span>
            <span style={{ color: "#2EB7FF" }}>SMS.</span>
          </div>
          <div style={{ marginTop: "26px", fontSize: "31px", color: "#C3D2E4", maxWidth: "880px", lineHeight: 1.35 }}>
            Få besked, når kommuner, regioner og staten har en opgave, der passer til dit fag og dit område.
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
            Gratis i 14 dage · ingen binding
          </div>
          <div style={{ display: "flex", fontSize: "29px", fontWeight: 700, color: "#7FD0FF" }}>birdly.dk</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
