"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCatalog } from "../../lib/catalog";
import { hentKandidater, visResultat } from "../../lib/kandidater";
import { daTal } from "../../lib/opgaveTal";
import OpgaveKort from "./OpgaveKort";
import Cta from "./Cta";
import { useFag } from "./FagKontekst";
import { sporFunnel } from "../../lib/ctaSporing";

// ============================================================================
// "SE HVAD BIRDLY FINDER" — sidens vigtigste bevis.
//
// ⚠️ ALT HER ER ÆGTE ELLER TOMT. Tallet OG opgaverne kommer fra
// preview-kandidater, som kalder birdly_match_candidates_for — selve
// match-reglen. Det er nøjagtig samme opslag kunden får i funnelen, med samme
// kriterier. Der findes ikke ét opdigtet felt i denne komponent.
//
// ⚠️ DE GENERISKE EKSEMPLER ER FJERNET (06-09-2026), og det er hele pointen med
// omskrivningen. Sektionen viste før de tre nyest hentede udbud i HELE
// beholdningen — "High Security Tabletop Display Cases", et forsikringsudbud, et
// finans-IT-system. En rengøringsejer der lige har klikket "Rengøring" og så
// læser dét, konkluderer det modsatte af hvad sektionen skal bevise: at Birdly
// IKKE forstår hendes fag. Et irrelevant bevis er værre end intet bevis.
//
// ⚠️ RENGØRING ER FORVALGT. Det er den nuværende primære målgruppe, og en
// sektion der starter tom beder den besøgende om at arbejde for beviset. Alle
// andre fag er ét klik væk og lige så ægte.
//
// ⚠️ EKSEMPLERNE KRÆVER DEN NYE preview-kandidater. Feltet `eksempler` er
// additivt og udrulles separat (birdly-admin, gren `relaunch-eksempler`). Indtil
// da returnerer funktionen kun tallet — og så viser vi tallet uden kort frem for
// at falde tilbage på noget irrelevant. Se `manglerEksempler` nedenfor.
// ============================================================================

// Rækkefølgen er GTM-prioriteret: rengøring og service først, fordi det er dem
// annoncerne peger på lige nu. Nøglerne valideres mod kataloget — findes en
// ikke, renderes knappen slet ikke.
const FAG = [
  { key: "rengoring", navn: "Rengøring", ord: "rengøringsopgaver" },
  { key: "service", navn: "Service", ord: "serviceopgaver" },
  { key: "elektriker", navn: "Elektriker", ord: "elektrikeropgaver" },
  { key: "vvs", navn: "VVS", ord: "VVS-opgaver" },
  { key: "tomrer", navn: "Tømrer", ord: "tømreropgaver" },
  { key: "entreprenor", navn: "Entreprenør", ord: "entreprenøropgaver" },
];

const STANDARD = "rengoring";

/**
 * @param {string} [laastFag]  Låser sektionen til ét fag og skjuler fanerne.
 *   ⚠️ BRUGES PÅ FAG-SIDERNE. En /fag/rengoring-side er allerede et svar på
 *   "hvilket fag?", og faner dér ville invitere den besøgende til at forlade den
 *   side hun lige er landet på — og til at se et bevis der ikke handler om
 *   hende. På forsiden er fanerne omvendt hele pointen.
 */
export default function FagBevis({ funnelHref, laastFag = null }) {
  const [katalog, setKatalog] = useState(null);
  // ⚠️ FAGET ER DELT MED VÆRDI-ANKERET længere nede på siden. Vælger den
  // besøgende "VVS" her, skal regnestykket dernede også være en VVS-opgave —
  // ellers ser en VVS'er sit eget fag i beviset og en rengøringsaftale som sit
  // eksempel to sektioner senere. Se components/salg/FagKontekst.js.
  const { fag: fraKontekst, setFag: setValgt } = useFag(STANDARD);
  const valgt = laastFag || fraKontekst;
  const [svar, setSvar] = useState(null);
  const [henter, setHenter] = useState(true);
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

  // Forvalget hentes så snart kataloget er der — beviset skal stå på skærmen
  // uden at den besøgende gør noget.
  useEffect(() => {
    if (!katalog) return;
    if (!fagByKey[valgt]) return;
    let levende = true;
    const mit = ++nr.current;
    setHenter(true);
    setSvar(null);

    // Samme kriterier som en kunde der vælger faget og lader alt stå: alle
    // fagets arbejdsområder, bredde "alle", hele landet. Reproducerbart —
    // hun kan gå ind i funnelen og få det samme tal.
    const koder = (fagByKey[valgt]?.smal || []).map((a) => a.cpv).filter(Boolean);
    hentKandidater({
      fag_keys: [valgt],
      cpv_selections: koder,
      bredde: "alle",
      region_keys: ["hele_dk"],
      min_amount: null,
      max_amount: null,
      med_eksempler: true,
    }).then((k) => {
      if (!levende || mit !== nr.current) return;
      setSvar(k);
      setHenter(false);
      // ⚠️ INTERN HÆNDELSE, ingen Meta. Den fortæller om beviset faktisk viste
      // noget for det valgte fag — altså om sektionen gjorde sit arbejde eller
      // stod med en tom tilstand. Se lib/ctaSporing.js.
      sporFunnel("OpportunityProofViewed", {
        fag: valgt,
        antal: k?.i_omraade || 0,
        eksempler: (k?.eksempler || []).length,
      });
    });

    return () => { levende = false; };
  }, [katalog, fagByKey, valgt]);

  const aktuelt = tilgaengelige.find((f) => f.key === valgt);
  const tilstand = svar ? visResultat(svar) : null;
  // ⚠️ region_keys = ["hele_dk"], så i_omraade ER landstallet. Teksten siger
  // derfor "i hele landet" — aldrig "i dit område", som ville være et løfte om
  // en geografi den besøgende ikke har valgt endnu.
  const antal = svar?.i_omraade || 0;
  const eksempler = svar?.eksempler || [];
  // Tallet er der, men den udrullede Edge Function kender ikke feltet endnu.
  const manglerEksempler = tilstand !== "intet" && antal > 0 && eksempler.length === 0;

  return (
    <section className="sg-sek sg-graa" id="bevis">
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Se det selv</span>
          <h2 className="sg-big">Se hvad Birdly finder.</h2>
          <p className="sg-lead">
            {laastFag ? "Aktuelle muligheder i jeres fag, lige nu." : "Vælg et fag og se aktuelle muligheder."}
          </p>
        </div>

        <div className="sg-fagvalg" role="group" aria-label="Vælg et fag" hidden={!!laastFag}>
          {tilgaengelige.map((f) => (
            <button
              key={f.key}
              type="button"
              className={"sg-fagknap" + (valgt === f.key ? " on" : "")}
              aria-pressed={valgt === f.key}
              onClick={() => { setValgt(f.key); sporFunnel("VerticalSelected", { fag: f.key, kilde: "bevis" }); }}
            >
              {f.navn}
            </button>
          ))}
        </div>

        <div className="sg-fagpanel" aria-live="polite">
          {henter && (
            <p className="sg-lead sg-midt" style={{ marginTop: 0 }}>
              Vi kigger efter {aktuelt?.ord || "opgaver"}…
            </p>
          )}

          {/* ⚠️ ÆRLIG TOM-TILSTAND. Enten er der intet lige nu, eller også fejlede
              opslaget. Begge dele siger vi det samme om — vi holder øje — frem for
              at finde på et tal, og ALDRIG ved at falde tilbage på et udbud fra et
              andet fag. */}
          {!henter && (tilstand === "intet" || antal === 0) && (
            <div className="sg-midt">
              <h3 style={{ fontSize: 22 }}>
                Der er ingen aktive match i denne kategori lige nu.
              </h3>
              <p className="sg-lead" style={{ marginTop: 10 }}>
                Birdly holder fortsat øje. Vi henter nyt to gange om dagen og sender besked,
                så snart der er noget til jer.
              </p>
            </div>
          )}

          {!henter && tilstand !== "intet" && antal > 0 && (
            <>
              <p className="sg-fagsvar-linje">
                Birdly holder lige nu øje med <b>{daTal(antal)}</b> relevante{" "}
                {aktuelt?.ord || "opgaver"} i hele landet.
              </p>

              {eksempler.length > 0 && (
                <div className="sg-opgaver">
                  {eksempler.map((n, i) => (
                    <OpgaveKort key={i} opgave={n} />
                  ))}
                </div>
              )}

              {manglerEksempler && (
                /* ⚠️ HELLERE INGEN KORT END FORKERTE KORT. Tallet er ægte og står
                   der; eksemplerne kommer, når den additive udgave af
                   preview-kandidater er rullet ud. Vi udfylder ALDRIG hullet med
                   opgaver fra et andet fag. */
                <p className="sg-laast" style={{ marginTop: 18 }}>
                  Selve opgaverne får I i beskeden, når de matcher jeres kriterier.
                </p>
              )}

              <p className="sg-laast">
                Køber, frist og materiale følger med i beskeden, når opgaven er et match til jer.
              </p>
            </>
          )}
        </div>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="fag-bevis" />
        </div>
      </div>
    </section>
  );
}
