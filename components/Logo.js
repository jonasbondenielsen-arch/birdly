import Link from "next/link";

// Shared Birdly logo — ÉN kilde. Skift filerne i /public, så ændres logoet
// ALLE steder der bruger disse komponenter.
//
// <Logo>     = det fulde vandrette logo (fugl + "Birdly.dk"), til lyse baggrunde
//              (header). Vist som leveret (SVG, skarpt + skalerbart).
// <BirdMark> = kun fugle-mærket i brandfarvet firkant — til mørke baggrunde
//              (footer), favicon og små ikoner, hvor ordmærket ville være ulæseligt.

export function Logo({ height = 30, linkHome = true, className = "" }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = (
    <img src="/birdly-logo.svg" alt="Birdly.dk" style={{ height, width: "auto", display: "block" }} className={className} />
  );
  return linkHome ? (
    <Link href="/" aria-label="Birdly forside" style={{ display: "inline-flex" }}>
      {img}
    </Link>
  ) : (
    img
  );
}

export function BirdMark({ size = 30, alt = "Birdly", className = "" }) {
  // Højde-baseret + auto bredde, så fuglens proportioner bevares (ikke kvadratisk).
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src="/birdly-bird.svg" alt={alt} style={{ height: size, width: "auto", display: "block" }} className={className} />
  );
}
