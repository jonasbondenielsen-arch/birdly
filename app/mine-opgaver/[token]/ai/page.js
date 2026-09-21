import Link from "next/link";
import { hentAiAdgang, AI_ADRESSE } from "../../../../lib/aiAdgang";
import AiForbindelser from "../../../../components/AiForbindelser";

// "Brug Birdly i din AI" — kundens kontrolflade for AI-adgang.
//
// ⚠️ EGEN UNDERSIDE, IKKE EN ÆNDRING AF SAMLESIDEN. `components/MineOpgaver.js`
// er live for betalende kunder, og dedupe, adgangsspærring og "Nyt"-badget
// hænger sammen med Edge Functions i birdly-admin. En ny sektion derinde ville
// være en risiko uden gevinst; en underside er additiv og kan rulles tilbage
// ved at slette en mappe.
//
// ⚠️ INGEN "TILKNYT"-KNAP. Hverken ChatGPT eller Claude understøtter i dag at et
// tredjepartswebsted starter en forbindelse — kunden tilføjer den selv inde i
// AI'en. En knap her ville love noget platformen ikke kan levere, og kunden
// ville tro at Birdly var i stykker. Derfor: adressen, en vejledning, og
// kontrol over det der ER forbundet.
export const metadata = {
  title: "Brug Birdly i din AI",
  robots: { index: false, follow: false }, // privat token-side — aldrig i søgeresultater
};

export default async function Page({ params }) {
  const { token } = await params;
  const data = await hentAiAdgang(token);

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: "46rem" }}>
        <p style={{ marginBottom: ".5rem" }}>
          <Link href={`/mine-opgaver/${token}`}>← Tilbage til mine opgaver</Link>
        </p>

        <h1 className="big">Brug Birdly i din AI</h1>
        <p className="lead">
          Arbejd med dine Birdly-opgaver direkte i den AI, du allerede bruger.
          Spørg for eksempel: <em>&laquo;Hvad har Birdly fundet til mig?&raquo;</em>
        </p>

        {!data.found && (
          <p>Vi kunne ikke finde din konto. Prøv linket fra din seneste besked fra Birdly.</p>
        )}

        {data.found && !data.kan_forbinde && (
          // ⚠️ SIG DET LIGE UD. En vejledning der ender i et nej, er værre end
          // en besked om at det ikke er åbnet for hende endnu.
          <p>
            Det her er ikke åbnet for din konto endnu. Skriv til os, hvis du vil være
            med i testen — så sætter vi det op.
          </p>
        )}

        {data.found && data.kan_forbinde && (
          <AiForbindelser
            token={token}
            adresse={AI_ADRESSE}
            forbindelser={data.forbindelser || []}
          />
        )}
      </div>
    </main>
  );
}
