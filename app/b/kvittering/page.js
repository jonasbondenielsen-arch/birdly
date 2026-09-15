import { Logo } from "../../../components/Logo";
import "../../start.css";

// /b/kvittering — accept_url efter kortløs betaling (05-08-2026).
//
// ⚠️ KVITTERINGEN ER IKKE AKTIVERINGEN. Reepay sender kunden hertil når kortet er
// godkendt, men det er `subscription_created`-webhooken der faktisk flytter hende
// til betalende — og for en LUKKET kortløs er det genåbnings-grenen i webhooken
// der åbner adgangen igen. Derfor lover siden ikke at alt allerede er på plads;
// den siger hvad vi ved, og at listen er åben igen "om et øjeblik".
//
// ⚠️ Statisk rute — den vinder over /b/[code] i Next's routing, så en kunde med
// koden "kvittering" ville ramme denne side. Koderne er 8 tegn, så det kan ikke ske.
export const metadata = {
  title: "Tak — du er i gang igen",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="st-wrap">
      <div className="st-top"><Logo height={30} /></div>
      <div className="st-kort st-kvit">
        <div className="st-ic">✓</div>
        <h1>Tak — du er i gang igen.</h1>
        <p className="st-hj">
          Vi har modtaget din betaling. Din opgaveliste åbner igen om et øjeblik, og vi
          holder øje videre — du får besked på SMS og mail, så snart der er en opgave,
          der passer til jer.
        </p>
        <p className="st-mini">Kvitteringen kommer på mail fra Frisbii.</p>
      </div>
    </main>
  );
}
