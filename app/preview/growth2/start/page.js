import Growth2Start from "../../../../components/preview/Growth2Start";

// ⚠️ PREVIEW. IKKE PRODUKTION. IKKE INDEKSERBAR.
// Ruten findes kun på branchen `growth-2-preview` og må ikke merges til main
// uden en eksplicit beslutning. `?uden=1` skjuler linjen "Se jeres matches
// først. Opret jer bagefter.", så de to varianter kan ses side om side.
export const metadata = {
  title: "Preview — Growth #2 /start",
  robots: { index: false, follow: false, nocache: true },
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <Growth2Start visMatchLinje={sp?.uden !== "1"} />;
}
