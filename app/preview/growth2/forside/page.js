import Growth2Forside from "../../../../components/preview/Growth2Forside";

// ⚠️ PREVIEW. IKKE PRODUKTION. IKKE INDEKSERBAR. Den levende forside på
// roden er uberørt.
export const metadata = {
  title: "Preview — Growth #2 forside",
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <Growth2Forside />;
}
