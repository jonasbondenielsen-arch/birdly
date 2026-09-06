"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCatalog } from "../../lib/catalog";
import { hentKandidater, visResultat } from "../../lib/kandidater";
import { daTal } from "../../lib/opgaveTal";
import Cta from "./Cta";

// ============================================================================
// SEKTION 6 — "Se hvad Birdly finder". Personligt bevis, ægte tal.
//
// ⚠️ TALLET ER ÆGTE OG KOMMER FRA SELVE MATCH-REGLEN. Vi kalder
// preview-kandidater (birdly-admin), som er den samme funktion trin 4 i funnelen
// bruger — og den kører birdly_match_candidates_for. Tallet her kan derfor ikke
// afvige fra det kunden får at se ét klik senere. Var det et separat estimat,
// ville de to sider af samme funnel kunne modsige hinanden, og det er præcis den
// slags uoverensstemmelse en kunde opdager på det værste tidspunkt.
//
// ⚠️ HVAD DER IKKE VISES, OG HVORFOR (paywall-grænsen, 30-07-2026, bekræftet af
// Jonas 06-09-2026): ingen frister, ingen beløb, ingen købere, ingen id'er.
// Tallet og titlerne beviser at der sker noget; detaljerne er dét kunden betaler
// for. Tilføjer du et felt her, forærer du produktet væk — og du kan i øvrigt
// ikke: get-opgave-tal returnerer dem ikke.
//
// ⚠️ TITLERNE ER IKKE FAG-FILTREREDE, OG TEKSTEN SIGER DET. `seneste` fra
// get-opgave-tal er de tre nyest hentede bydbare udbud i HELE beholdningen — der
// findes ingen kilde til titler pr. fag (branchetallene blev bevidst fjernet
// 30-07-2026, og 6B ville kræve en ny Edge Function i det andet repo). Derfor
// står de under deres egen overskrift som "det seneste vi har hentet", ikke som
// "dine match". At lade dem skifte med fag-knappen ville være en løgn på tre
// linjer.
//
// ⚠️ FEJLER KALDET, PÅSTÅR VI INTET. visResultat() giver "intet", og så står der
// at vi holder øje — hvilket er sandt uanset. Et gættet tal ville være værre end
// intet tal.
// ============================================================================

// De seks fag sektionen tilbyder. ⚠️ NØGLERNE VALIDERES MOD KATALOGET — findes en
// nøgle ikke (fx hvis et fag omdøbes i admin), renderes knappen slet ikke frem
// for at sende en værdi ingen kender videre i funnelen.
const FAG = [
  { key: "rengoring", navn: "Rengøring" },
  { key: "tomrer", navn: "Tømrer" },
  { key: "vvs", navn: "VVS" },
  { key: "elektriker", navn: "Elektriker" },
  { key: "entreprenor", navn: "Entreprenør" },
  { key: "service", navn: "Service" },
];

export default function FagBevis({ funnelHref, seneste = [] }) {
  const [katalog, setKatalog] = useState(null);
  const [valgt, setValgt] = useState(null);
  const [svar, setSvar] = useState(null);
  const [henter, setHenter] = useState(false);
  // Løbenummer pr. opslag. Klikker man hurtigt gennem fire fag, kommer svarene
  // tilbage i vilkårlig rækkefølge; uden det her kunne et LANGSOMT svar fra et
  // fravalgt fag lande til sidst og stå med det forkerte fagnavn over sig.
  const nr = useRef(0);

  useEffect(() => {
    let levende = true;
    fetchCatalog()
      .then((k) => { if (levende) setKatalog(k); })
      .catch(() => { if (levende) setKatalog({ fag: [] }); });
    return () => { levende = false; };
  }, []);

  const fagByKey = useMemo(
    () => Object.fromEntries((katalog?.fag || []).map((f) => [f.key, f])),
    [katalog]
  );
  const tilgaengelige = FAG.filter((f) => fagByKey[f.key]);

  async function vaelg(f) {
    if (henter && valgt === f.key) return;
    const mit = ++nr.current;
    setValgt(f.key);
    setSvar(null);
    setHenter(true);

    // Samme kriterier som en kunde der vælger faget og lader alt stå: alle fagets
    // arbejdsområder, bredde "alle", hele landet. Det er det bredeste ÆRLIGE tal
    // — og det er reproducerbart, fordi hun kan gå ind i funnelen og få samme.
    const koder = (fagByKey[f.key]?.smal || []).map((a) => a.cpv).filter(Boolean);
    const k = await hentKandidater({
      fag_keys: [f.key],
      cpv_selections: koder,
      bredde: "alle",
      region_keys: ["hele_dk"],
      min_amount: null,
      max_amount: null,
    });

    if (mit !== nr.current) return; // overhalet af et nyere klik — det vinder
    setSvar(k);
    setHenter(false);
  }

  const fagNavn = tilgaengelige.find((f) => f.key === valgt)?.navn || "";
  const tilstand = svar ? visResultat(svar) : null;
  // ⚠️ region_keys = ["hele_dk"], så i_omraade ER landstallet. De to felter er
  // her det samme, og teksten siger "i hele landet" — aldrig "i dit område",
  // som ville være et løfte om en geografi kunden ikke har valgt endnu.
  const antal = svar?.i_omraade || 0;

  return (
    <section className="sg-sek sg-graa" id="bevis">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Se det selv</span>
          <h2 className="sg-big">Se hvad Birdly finder.</h2>
          <p className="sg-lead">Vælg et fag.</p>
        </div>

        <div className="sg-fagvalg" role="group" aria-label="Vælg et fag">
          {tilgaengelige.map((f) => (
            <button
              key={f.key}
              type="button"
              className={"sg-fagknap" + (valgt === f.key ? " on" : "")}
              aria-pressed={valgt === f.key}
              onClick={() => vaelg(f)}
            >
              {f.navn}
            </button>
          ))}
          {/* Kataloget er ikke hentet endnu — vis knapperne som tekst frem for at
              lade sektionen stå tom et halvt sekund. */}
          {tilgaengelige.length === 0 && (
            <p className="sg-lead" style={{ marginTop: 0 }}>Henter fagene…</p>
          )}
        </div>

        <div className="sg-fagpanel" aria-live="polite">
          {!valgt && (
            <div className="sg-fagsvar">
              <p className="sg-lead" style={{ marginTop: 0 }}>
                Tryk på et fag, så viser vi hvor mange opgaver Birdly holder øje med lige nu.
              </p>
            </div>
          )}

          {valgt && henter && (
            <div className="sg-fagsvar">
              <p className="sg-lead" style={{ marginTop: 0 }}>Vi kigger efter {fagNavn.toLowerCase()}…</p>
            </div>
          )}

          {valgt && !henter && tilstand === "intet" && (
            /* ⚠️ ÆRLIG TOM-TILSTAND. Enten er der intet lige nu, eller også
               fejlede opslaget. Begge dele siger vi det samme om — vi holder øje
               — frem for at finde på et tal eller vise et nul der ligner et dødt
               produkt. */
            <div className="sg-fagsvar">
              <h3 style={{ fontSize: 22 }}>Birdly holder øje.</h3>
              <p className="sg-fagsvar-under">
                Der er ingen aktive match i {fagNavn.toLowerCase()} lige nu. Det skifter
                løbende — vi henter nyt to gange om dagen og sender besked, så snart
                der er noget til jer.
              </p>
            </div>
          )}

          {valgt && !henter && tilstand !== "intet" && tilstand !== null && (
            <div className="sg-fagsvar">
              <div className="sg-tal">{daTal(antal)}</div>
              <p className="sg-fagsvar-under">
                opgaver matcher <b>{fagNavn.toLowerCase()}</b> i hele landet lige nu
              </p>
              <p className="sg-fin" style={{ marginTop: 12 }}>
                Tallet er hentet med den samme matchning I får som kunde. I vælger selv
                område og opgavestørrelse, så jeres eget tal bliver mere præcist.
              </p>
            </div>
          )}
        </div>

        {/* ⚠️ EGEN OVERSKRIFT, IKKE UNDER FAG-TALLET. Titlerne er de tre nyest
            hentede i hele beholdningen — ikke i det valgte fag. Stod de under
            tallet uden den her overskrift, ville de læses som "dine match". */}
        {seneste.length > 0 && (
          <div style={{ maxWidth: 720, margin: "34px auto 0" }}>
            <p className="sg-fin" style={{ textAlign: "center", marginTop: 0, marginBottom: 12 }}>
              Det seneste Birdly har hentet — på tværs af alle fag:
            </p>
            <ul className="sg-titler">
              {seneste.map((n, i) => (
                <li key={i}>
                  <span className="sg-mrk">OFFENTLIG</span>
                  <span>{n.titel}</span>
                </li>
              ))}
            </ul>
            <p className="sg-laast">
              Køber, frist og beløb følger med i beskeden, når opgaven er et match til jer.
            </p>
          </div>
        )}

        <div className="sg-cta-row sg-midt" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="fag-bevis" />
        </div>
      </div>
    </section>
  );
}
