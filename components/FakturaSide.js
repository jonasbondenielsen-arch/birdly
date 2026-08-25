"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BirdMark } from "./Logo";
import "../app/start.css";
import "../app/privat-lead.css";

// ============================================================================
// /f/[token] — kundens egen faktura.
//
// ⚠️ INGEN BETALINGSKNAP. Clearhaus er ikke live, og fakturaen betales ved
// bankoverførsel efter oplysningerne i PDF'en. En "betal nu"-knap der ikke kan
// tage imod penge er værre end ingen: kunden trykker, der sker ingenting, og så
// tror hun at hun har betalt.
//
// ⚠️ SIDEN VISER IKKE MERE END FAKTURAEN GØR. Firmanavn, beløb og forfald står
// allerede i PDF'en. Der hentes ikke kundedata, og der er ingen vej herfra til
// andre fakturaer.
//
// ⚠️ SAMME SVAR PÅ ALLE FEJL. Ukendt token, forkert format og udløbet signatur
// giver den samme besked. Kunne man skelne, kunne man bekræfte at et token
// findes uden at kunne læse fakturaen.
//
// ⚠️ BETINGELSERNE SKAL STÅ HER OG I MAILEN. Fakturaen er grundlaget for et
// abonnement, og kunden skal kunne finde vilkårene fra det sted hun betaler ud
// fra — ikke kun i den mail hun måske har slettet.
// ============================================================================

const FN_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/faktura`;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function FakturaSide({ token }) {
  const [data, setData] = useState(null);
  const [fejl, setFejl] = useState(false);

  useEffect(() => {
    fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
      headers: { Authorization: `Bearer ${ANON}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((b) => (b?.ok ? setData(b) : setFejl(true)))
      .catch(() => setFejl(true));
  }, [token]);

  const fornavn = String(data?.navn || "").trim().split(/\s+/)[0] || "";

  return (
    <div className="pl">
      <header className="pl-top">
        <Link href="/" className="pl-mark" aria-label="Birdly forside">
          <BirdMark size={26} />
          <span>Birdly<span className="pl-dk">.dk</span></span>
        </Link>
      </header>

      <main className="pl-wrap">
        {fejl ? (
          <div className="pl-kort" style={{ textAlign: "center" }}>
            <h2>Linket virker ikke</h2>
            <p className="pl-besk">
              Linket er forkert eller udløbet. Har du fået det i en SMS eller mail fra
              Birdly, så prøv at åbne det direkte derfra — ellers skriv til{" "}
              <a href="mailto:support@birdly.dk">support@birdly.dk</a>.
            </p>
          </div>
        ) : !data ? (
          <div className="pl-henter">Henter fakturaen …</div>
        ) : (
          <div className="pl-kort">
            <h2>Din faktura fra Birdly.dk</h2>
            <p className="pl-besk">
              Hej{fornavn ? ` ${fornavn}` : ""}. Her er din faktura for dit årsabonnement hos
              Birdly. Beløbet betales via bankoverførsel til kontoen på fakturaen inden
              forfaldsdatoen. Har du spørgsmål, så skriv til{" "}
              <a href="mailto:support@birdly.dk">support@birdly.dk</a>.
            </p>

            <div className="fak-fakta">
              <div><span>Faktura</span><b>{data.faktura_nr}</b></div>
              {data.firma && <div><span>Virksomhed</span><b>{data.firma}</b></div>}
              {data.beloeb != null && (
                <div>
                  <span>Beløb</span>
                  <b>{Number(data.beloeb).toLocaleString("da-DK", { minimumFractionDigits: 2 })} DKK</b>
                </div>
              )}
              {data.forfald && (
                <div>
                  <span>Forfald</span>
                  <b>{new Date(data.forfald).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}</b>
                </div>
              )}
            </div>

            {/* ⚠️ target="_blank": mobilbrowsere åbner PDF'en i en fremviser, og uden
                det mister kunden siden — og dermed vejen tilbage til linket. */}
            <a
              className="pl-mini primaer fak-knap"
              href={data.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Se / hent faktura (PDF)
            </a>

            <p className="pl-note" style={{ marginTop: 22 }}>
              <a href="/handelsbetingelser" target="_blank" rel="noopener noreferrer">
                Handels- &amp; forretningsbetingelser
              </a>{" "}
              ·{" "}
              <a href="/abonnementsbetingelser" target="_blank" rel="noopener noreferrer">
                Abonnementsbetingelser
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
