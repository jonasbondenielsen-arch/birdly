"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BirdMark } from "./Logo";
import { hentTeaser, tagTeaser } from "../lib/privatOpgave";
import { omfangTekst } from "../lib/omfang";
import { priceText } from "../lib/pakke";
import "../app/start.css";
import "../app/privat-lead.css";

// ============================================================================
// /t/[token] — ENGANGS TEASER TIL EN VIRKSOMHED HVIS ADGANG ER UDLØBET.
//
// ⚠️ DEN HER SIDE VISER ALDRIG KONTAKTOPLYSNINGER. Ikke "endnu ikke", ikke "kun
// hvis" — serveren sender dem simpelthen ikke til dette endepunkt, uanset hvad
// virksomheden har gjort. Kontakten åbnes først på den almindelige opgaveside,
// og først når hun både har taget en plads og er tilmeldt igen. Bygger du her en
// visning der leder efter `kontakt`, leder du efter noget der ikke kan komme.
//
// ⚠️ HVORFOR EN SELVSTÆNDIG KOMPONENT OG IKKE ET FLAG I PrivatLead. Fordi den
// side ER bygget til at vise et telefonnummer, når betingelsen er opfyldt. Delte
// de kode, ville hver fremtidig ændring dér skulle huske på gaten her — og den
// dag nogen glemmer det, lækker vi en privatpersons nummer til en der ikke er
// kunde. To adskilte sider er lettere at holde rigtige end én med et flag i.
//
// ⚠️ RÆKKEFØLGEN ER JONAS': tag opgaven, vælg så plan. Tilmeldings-linket kommer
// først fra serveren, når pladsen er taget. Lå det på siden fra start, ville
// teaseren læse som en salgsside med en opgave på — og ikke som en opgave hun
// kan tage.
//
// ⚠️ 24 TIMER. Serveren afgør døden; siden gætter aldrig selv på om linket lever.
// ============================================================================

export default function TeaserLead({ token }) {
  const [data, setData] = useState(null);
  const [fejl, setFejl] = useState("");
  const [travl, setTravl] = useState(false);

  const hent = useCallback(async () => {
    try {
      setData(await hentTeaser(token));
    } catch (e) {
      setFejl(e.kode === "udloebet" ? "udloebet" : e.kode === "ukendt_link" ? "ukendt" : "fejl");
    }
  }, [token]);

  useEffect(() => { hent(); }, [hent]);

  async function tag() {
    setTravl(true);
    setFejl("");
    try {
      setData(await tagTeaser(token));
    } catch (e) {
      if (e.kode === "optaget" || e.kode === "udloebet" || e.kode === "lukket") {
        await hent();
        setFejl(e.kode);
      } else setFejl("fejl");
    } finally {
      setTravl(false);
    }
  }

  if (fejl === "udloebet") {
    return (
      <Ramme>
        <Besked
          titel="Tilbuddet er udløbet"
          tekst="Det her var et engangstilbud, som gjaldt i 24 timer. Vil du gerne se private opgaver igen, kan du tilmelde dig Birdly på forsiden."
        />
      </Ramme>
    );
  }
  if (fejl === "ukendt") {
    return <Ramme><Besked titel="Linket virker ikke" tekst="Linket er forkert eller udløbet. Har du fået det i en SMS fra Birdly, så prøv at åbne det direkte derfra." /></Ramme>;
  }
  if (!data && !fejl) return <Ramme><div className="pl-henter">Henter opgaven …</div></Ramme>;
  if (!data) return <Ramme><Besked titel="Noget gik galt" tekst="Prøv at genindlæse siden." /></Ramme>;

  const { opgave, pladser, min_plads, betalt, fortsaet_token } = data;
  const harPlads = min_plads != null;
  const optaget = pladser.taget >= pladser.i_alt && !harPlads;
  const lukket = opgave.status !== "aktiv" && !harPlads;

  return (
    <Ramme>
      <div className={"pl-taeller" + (optaget || lukket ? " tom" : pladser.tilbage === 1 ? " sidste" : "")}>
        {harPlads ? (
          <><b>Du har taget opgaven</b> — plads {min_plads} af {pladser.i_alt}</>
        ) : optaget || lukket ? (
          <><b>Opgaven er optaget</b> — {pladser.i_alt} virksomheder har taget den</>
        ) : (
          <><b>{pladser.taget} af {pladser.i_alt} pladser taget</b>
            {pladser.tilbage === 1 ? " · 1 plads tilbage" : ` · ${pladser.tilbage} pladser tilbage`}</>
        )}
      </div>

      <h1 className="pl-h1">Vi har fundet denne opgave, som vi tror matcher dig godt.</h1>

      {/* ---------- OPGAVEN (anonym) ----------
          ⚠️ INGEN PII. Navn, adresse, telefon og billeder er bevidst udeladt —
          serveren sender dem ikke, og siden beder ikke om dem. */}
      <div className="pl-kort">
        <h2>Opgaven</h2>
        <p className="pl-besk">{opgave.beskrivelse}</p>
        <div className="pl-meta">
          {opgave.fag?.length > 0 && <span>{opgave.fag.join(", ")}</span>}
          {opgave.postnr && <span>Postnummer {opgave.postnr}</span>}
          {opgave.hvornaar && <span>{opgave.hvornaar}</span>}
          {opgave.omfang && omfangTekst(opgave.omfang) && (
            <span>{omfangTekst(opgave.omfang)} — kundens eget skøn</span>
          )}
        </div>
      </div>

      {/* ---------- BETINGELSEN ----------
          ⚠️ STÅR FØR KNAPPEN, IKKE EFTER. Virksomheden skal kende betingelsen,
          inden hun bruger en af de tre pladser — ellers har hun taget et valg på
          et forkert grundlag. Teksten lover ikke gratis kontakt noget sted. */}
      {!harPlads && !optaget && !lukket && (
        <div className="pl-kort">
          <p className="pl-besk">
            Du kan få udleveret kundens telefonnummer, hvis du er en af de første 3,
            der tager opgaven — og tilmelder dig Birdly igen.
          </p>
        </div>
      )}

      {!harPlads && !optaget && !lukket && (
        <button className="pl-knap" onClick={tag} disabled={travl}>
          {travl ? "Tager opgaven …" : "Tag opgaven"}
        </button>
      )}

      {/* ---------- EFTER PLADSEN ER TAGET ---------- */}
      {harPlads && !betalt && (
        <div className="pl-kort">
          <h2>Sidste trin: tilmeld dig igen</h2>
          <p className="pl-besk">
            Du har plads {min_plads} af {pladser.i_alt}. Kundens telefonnummer bliver
            låst op, så snart din tilmelding er registreret. Vælg måned eller år —
            vi sender dig en faktura, og du skal ikke foretage dig mere.
          </p>
          <div className="pl-meta"><span>{priceText.perMonthBoth} ex. moms</span></div>
          {fortsaet_token ? (
            <a className="pl-knap" href={`/fortsaet/${fortsaet_token}`}>Vælg plan</a>
          ) : (
            // ⚠️ ALDRIG ET GÆTTET LINK. Mangler tokenet, siger vi det — frem for at
            // sende hende et sted hen hvor hun ikke kan gøre noget.
            <p className="pl-besk">
              Skriv til <a href="mailto:hello@birdly.dk">hello@birdly.dk</a>, så sender vi dig
              tilmeldingen med det samme.
            </p>
          )}
        </div>
      )}

      {harPlads && betalt && (
        <div className="pl-kort">
          <h2>Du er tilmeldt igen</h2>
          <p className="pl-besk">
            Kundens kontaktoplysninger ligger nu på din almindelige opgaveside. Du har
            fået linket i en mail fra os.
          </p>
        </div>
      )}

      {(optaget || lukket) && (
        <div className="pl-kort">
          <p className="pl-besk">
            {optaget
              ? "Tre virksomheder nåede at tage opgaven før dig. Sådan er reglen — der går kun tre af sted på hver opgave."
              : "Opgaven er lukket af kunden."}
          </p>
        </div>
      )}

      {fejl === "fejl" && <p className="pl-fejl">Noget gik galt. Prøv at genindlæse siden.</p>}
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
      {/* ⚠️ INTET "FRAVÆLG"-LINK HER. Modtageren er ikke kunde og har ingen
          opgaveside at slå noget fra på; et link dertil ville føre til en side hun
          ikke kan åbne. Det her er en engangsbesked, ikke en løbende udsendelse —
          og det er præcis derfor den kun sendes én gang. */}
      <footer className="pl-fravalg">
        Du har fået denne besked, fordi du tidligere har haft Birdly. Det er en
        engangshenvendelse — vi sender ikke flere, medmindre du tilmelder dig igen.
      </footer>
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
