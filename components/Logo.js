import Link from "next/link";

// Shared Birdly logo — ÉN kilde. Skift filerne i /public, så ændres logoet
// ALLE steder der bruger disse komponenter.
//
// <Logo>     = det fulde vandrette logo (fugl + "Birdly.dk"), til lyse baggrunde
//              (header). Vist som leveret (SVG, skarpt + skalerbart).
// <BirdMark> = kun fugle-mærket i brandfarvet firkant — til mørke baggrunde
//              (footer), favicon og små ikoner, hvor ordmærket ville være ulæseligt.

// ⚠️ `wordmark` FINDES FORDI SVG'EN HAR ".dk" BAGT IND.
// Det fulde logo er en billedfil, saa ordmaerket kan ikke aendres i kode. Paa
// et ikke-dansk marked ville "Birdly.dk" i headeren vaere forkert - copy-filen
// §27 siger "Brand/domain: Birdly". Med `wordmark` saettes fuglemaerket og
// teksten ved siden af hinanden i stedet, saa navnet er rigtigt nu og
// logo-asset'et kan komme i Fase B uden at noget skal laves om.
//
// ⚠️ INGEN PROP = SVG'EN, PRAECIS SOM FOER. Danmark rendrer det samme
// billede med den samme alt-tekst; der er ikke aendret et tegn paa den sti.
export function Logo({ height = 30, linkHome = true, className = "", wordmark = null }) {
  if (wordmark) {
    const mark = (
      <span className="sg-wordmark" style={{ height }}>
        <BirdMark size={height} alt={wordmark} />
        <span>{wordmark}</span>
      </span>
    );
    return linkHome ? (
      <Link href="/" aria-label={wordmark} style={{ display: "inline-flex" }}>{mark}</Link>
    ) : mark;
  }
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
