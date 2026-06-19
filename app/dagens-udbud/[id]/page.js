import Skabelon from "../../../components/Skabelon";
import DagensUdbudUdloebet from "../../../components/DagensUdbudUdloebet";
import { fetchPublicNotice } from "../../../lib/share";

// OFFENTLIG "dagens udbud"-side (intet token, intet login). Permanent link knyttet til
// udbuds-id'et, så gamle SoMe-opslag stadig virker. Viser den RIGTIGE bud-skabelon
// (samme komponent som kundernes private side) i publicMode: TOM (ingen kunde-data,
// ingen forhåndsudfyldning), men FULDT udfyldbar — fri afbenyttelse. publicMode tilføjer
// banner + smagsprøve-CTA, slår server-upload fra (kun lokal filnavn-liste) og gemmer
// indtastninger i browserens localStorage. Udbuddet vises i skabelonens Resumé-sektion.
// Når fristen er overskredet: pæn udløbet-side i samme layout. noindex (ephemert link).
export const metadata = {
  title: "Dagens udbud | Birdly",
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { id } = await params;
  const data = await fetchPublicNotice(id);
  // found:false dækker både udløbet frist OG ukendt/ugyldigt id → samme pæne udløbet-side.
  if (!data || !data.found) return <DagensUdbudUdloebet />;
  return <Skabelon publicMode data={data} />;
}
