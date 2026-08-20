"use client";

import { useCallback, useEffect, useState } from "react";
import { BirdMark } from "./Logo";
import Link from "next/link";
import { hentLead, reserverPlads, afvisLead, fjernLead } from "../lib/privatOpgave";
import "../app/start.css";
import "../app/privat-lead.css";

// ============================================================================
// /o/[token] — den ANONYME opgave-side som virksomheden lander på fra SMS'en.
//
// ⚠️ ANONYM INDTIL EN PLADS ER TAGET. Der er intet navn, ingen adresse og intet
// telefonnummer på denne side, før serveren har givet virksomheden plads 1, 2 eller 3.
// Komponenten kan ikke omgå det: kontaktoplysningerne findes simpelthen ikke i svaret
// før da. Byg aldrig en visning der antager de er der.
//
// ⚠️ TÆLLEREN ER ÆGTE URGENCY, ikke markedsføring. Der ER kun tre pladser, og de
// bliver taget af rigtige virksomheder. Derfor må teksten aldrig overdrive ("skynd
// dig!") — tallet siger det selv, og et opdigtet pres ville være det eneste uærlige
// på siden.
//
// ⚠️ INGEN CPV-KODER. Fagnavne, som alle andre steder.
// ============================================================================

const HVORFOR = {
  fag: "Opgaven er mærket som",
  region: "Opgaven ligger i",
  hvornaar: "Ønskes udført",
};

const REGION_NAVN = {
  hovedstaden: "Hovedstaden",
  sjaelland: "Sjælland",
  syddanmark: "Syddanmark",
  midtjylland: "Midtjylland",
  nordjylland: "Nordjylland",
};

// ⚠️ ENUM, IKKE FRITEKST. Teksterne her er etiketter på de fire koder serveren
// kender; ændrer du dem, ændrer du kun visningen — koden bagved er den der tælles.
const OUTCOMES = [
  ["afgivet_tilbud", "Jeg har afgivet tilbud til kunden"],
  ["kontaktet_ikke_aktuel", "Jeg kontaktede kunden — opgaven var ikke aktuel alligevel"],
  ["kontaktet_tabt", "Jeg kontaktede kunden — men tabte opgaven til en anden"],
  ["andet", "Andet"],
];

export default function PrivatLead({ token }) {
  const [data, setData] = useState(null);
  const [fejl, setFejl] = useState("");
  const [travl, setTravl] = useState(false);
  const [visFjern, setVisFjern] = useState(false);
  const [outcome, setOutcome] = useState("afgivet_tilbud");
  const [kommentar, setKommentar] = useState("");
  const [faerdig, setFaerdig] = useState("");

  const hent = useCallback(async () => {
    try {
      setData(await hentLead(token));
    } catch (e) {
      setFejl(e.kode === "ukendt_link" ? "ukendt" : "fejl");
    }
  }, [token]);

  useEffect(() => { hent(); }, [hent]);

  async function tag() {
    setTravl(true);
    setFejl("");
    try {
      setData(await reserverPlads(token));
    } catch (e) {
      // ⚠️ "Optaget" er ikke en fejl — det er et udfald. Vises som en tilstand, ikke
      // som en fejlbesked, og siden hentes igen så tælleren står rigtigt.
      if (e.kode === "optaget" || e.kode === "udloebet" || e.kode === "lukket") {
        await hent();
        setFejl(e.kode);
      } else {
        setFejl("fejl");
      }
    } finally {
      setTravl(false);
    }
  }

  async function ikkeMitFag() {
    setTravl(true);
    try {
      await afvisLead(token);
      setFaerdig("afvist");
    } catch { setFejl("fejl"); } finally { setTravl(false); }
  }

  async function fjern() {
    setTravl(true);
    try {
      await fjernLead(token, outcome, kommentar);
      setFaerdig("fjernet");
    } catch { setFejl("fejl"); } finally { setTravl(false); }
  }

  if (fejl === "ukendt") return <Ramme><Besked titel="Linket virker ikke" tekst="Linket er forkert eller udløbet. Har du fået det i en SMS fra Birdly, så prøv at åbne det direkte derfra." /></Ramme>;
  if (!data && !fejl) return <Ramme><div className="pl-henter">Henter opgaven …</div></Ramme>;
  if (!data) return <Ramme><Besked titel="Noget gik galt" tekst="Prøv at genindlæse siden." /></Ramme>;

  if (faerdig === "afvist") return <Ramme><Besked titel="Tak — så viser vi den ikke igen" tekst="Vi har noteret at opgaven ikke er i dit fag. Det hjælper os med at ramme bedre næste gang." /></Ramme>;
  if (faerdig === "fjernet") return <Ramme><Besked titel="Tak for svaret" tekst="Opgaven er fjernet fra din liste, og vi har noteret hvad der kom ud af den." /></Ramme>;

  const { opgave, pladser, min_plads, kontakt } = data;
  const harPlads = min_plads != null;
  const optaget = pladser.taget >= pladser.i_alt && !harPlads;
  const lukket = opgave.status !== "aktiv" && !harPlads;

  return (
    <Ramme>
      {/* ---------- TÆLLEREN ---------- */}
      <div className={"pl-taeller" + (optaget || lukket ? " tom" : pladser.tilbage === 1 ? " sidste" : "")}>
        {harPlads ? (
          <><b>Du har taget opgaven</b> — plads {min_plads} af {pladser.i_alt}</>
        ) : optaget || lukket ? (
          <><b>Opgaven er optaget</b> — {pladser.i_alt} virksomheder har taget den</>
        ) : (
          <>
            <b>{pladser.taget} af {pladser.i_alt} pladser taget</b>
            {pladser.tilbage === 1 ? " · 1 plads tilbage" : pladser.taget === 0 ? " — vær hurtig" : ` · ${pladser.tilbage} pladser tilbage`}
          </>
        )}
      </div>

      <h1 className="pl-h1">Privat opgave</h1>

      {/* ---------- HVORFOR DEN PASSER ---------- */}
      <div className="pl-hvorfor">
        <h2>Hvorfor det passer til dig</h2>
        <ul>
          {opgave.fag?.length > 0 && (
            <li><span>{HVORFOR.fag}</span> <b>{opgave.fag.join(", ")}</b> — det ligger i dit fag.</li>
          )}
          {opgave.region_key && (
            <li><span>{HVORFOR.region}</span> <b>{REGION_NAVN[opgave.region_key] || opgave.region_key}</b>, som du har valgt.</li>
          )}
          {opgave.hvornaar && (
            <li><span>{HVORFOR.hvornaar}</span> <b>{opgave.hvornaar.toLowerCase()}</b>.</li>
          )}
        </ul>
      </div>

      {/* ---------- OPGAVEN (anonym) ---------- */}
      <div className="pl-kort">
        <h2>Opgaven</h2>
        <p className="pl-besk">{opgave.beskrivelse}</p>
        <div className="pl-meta">
          {opgave.postnr && <span>Postnummer {opgave.postnr}</span>}
          {opgave.udbyder_type === "b2b" && <span>Oprettet af en virksomhed</span>}
        </div>
      </div>

      {/* ---------- KONTAKT (kun med plads) ---------- */}
      {harPlads && kontakt && (
        <div className="pl-kontakt">
          <h2>Kundens kontaktoplysninger</h2>
          <div className="pl-krow"><span>Navn</span><b>{kontakt.navn || "—"}</b></div>
          {kontakt.telefon && (
            <div className="pl-krow"><span>Telefon</span><a href={`tel:${kontakt.telefon}`}>{kontakt.telefon}</a></div>
          )}
          {/* E-mail er valgfri i formularen — vises kun hvis den er oplyst, frem for
              en tom række der ligner en fejl. */}
          {kontakt.email && (
            <div className="pl-krow"><span>E-mail</span><a href={`mailto:${kontakt.email}`}>{kontakt.email}</a></div>
          )}
          <p className="pl-note">
            Ring til kunden hurtigst muligt — to andre virksomheder kan have taget opgaven også.
            Aftale, pris og udførelse er mellem dig og kunden; Birdly er ikke part i den.
          </p>
        </div>
      )}

      {/* ---------- SÅDAN FUNGERER DET ---------- */}
      {!harPlads && (
        <div className="pl-sadan">
          <h2>Sådan fungerer private opgaver</h2>
          <p>
            Opgaven er sendt til alle virksomheder, den passer til. De første {pladser.i_alt},
            der trykker &ldquo;Kontakt kunden&rdquo;, får kundens telefonnummer og kan give et
            bud. Herefter lukkes opgaven — så det gælder om at være hurtig.
          </p>
        </div>
      )}

      {/* ---------- HANDLINGER ---------- */}
      {harPlads ? (
        visFjern ? (
          <div className="pl-fjern">
            <h2>Hvad kom der ud af opgaven?</h2>
            <p className="pl-fjern-hj">Det hjælper os med at sende dig bedre opgaver.</p>
            {OUTCOMES.map(([k, tekst]) => (
              <label key={k} className={"st-omrk" + (outcome === k ? " on" : "")}>
                <input type="radio" name="outcome" checked={outcome === k} onChange={() => setOutcome(k)} />
                <span><b>{tekst}</b></span>
              </label>
            ))}
            {outcome === "andet" && (
              <input className="st-felt" style={{ marginTop: 10 }} placeholder="Skriv gerne kort hvad der skete"
                value={kommentar} onChange={(e) => setKommentar(e.target.value)} />
            )}
            <button className="pl-btn" onClick={fjern} disabled={travl}>
              {travl ? "Gemmer …" : "Fjern opgaven"}
            </button>
            <button className="pl-btn-ghost" onClick={() => setVisFjern(false)} disabled={travl}>Fortryd</button>
          </div>
        ) : (
          <button className="pl-btn-ghost" onClick={() => setVisFjern(true)}>Fjern opgave fra min liste</button>
        )
      ) : optaget || lukket ? (
        <button className="pl-btn" disabled>Opgaven er optaget</button>
      ) : (
        <>
          <button className="pl-btn" onClick={tag} disabled={travl}>
            {travl ? "Reserverer …" : "Kontakt kunden →"}
          </button>
          <button className="pl-btn-ghost" onClick={ikkeMitFag} disabled={travl}>Ikke i mit fag</button>
        </>
      )}

      {fejl === "fejl" && <div className="st-fejl" style={{ marginTop: 14 }}>Noget gik galt. Prøv igen.</div>}
      {fejl === "optaget" && (
        <div className="pl-optaget-note">
          Tre andre virksomheder nåede det først. Du får besked næste gang der er en opgave i dit fag.
        </div>
      )}
      {fejl === "udloebet" && (
        <div className="pl-optaget-note">Opgaven er udløbet — kunden har ikke længere brug for bud.</div>
      )}
    </Ramme>
  );
}

function Ramme({ children }) {
  return (
    <div className="pl">
      <header className="pl-top">
        <Link href="/" className="pl-mark" aria-label="Birdly forside">
          <BirdMark size={26} />
          <span>Birdly<span className="pl-dk">.dk</span></span>
        </Link>
      </header>
      <main className="pl-wrap">{children}</main>
    </div>
  );
}

function Besked({ titel, tekst }) {
  return (
    <div className="pl-kort" style={{ textAlign: "center" }}>
      <h2>{titel}</h2>
      <p className="pl-besk">{tekst}</p>
    </div>
  );
}
