"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BirdMark } from "./Logo";
import { hentMinListe, opgaveLoest, opgaveIkkeLoest, genaabnOpgave } from "../lib/privatOpgave";
import { FORMIDLER_TEKST } from "../lib/formidlerTekst";
import "../app/start.css";
import "../app/privat-lead.css";

// ============================================================================
// /opgave/[token] — opretterens egen opgaveliste.
//
// ⚠️ SAMME MØNSTER SOM SMV-KUNDERNES OPGAVELISTE: link i mail/SMS, ingen konto, ingen
// adgangskode, ingen portal. Én mental model for alle der bruger Birdly.
//
// ⚠️ MEN LINKET UDLØBER. SMV-kundernes list_token lever så længe abonnementet gør;
// dette dør 24 timer efter hendes sidste opgave er lukket. Forskellen er at hun ikke
// er kunde og ikke har en konto — et evigt link til en privatpersons opgaveside er en
// stående eksponering hvis SMS'en videresendes. Serveren afgør det; denne side viser
// bare den rigtige besked når det er sket.
//
// ⚠️ KUN DE ACCEPTERENDE VIRKSOMHEDER VISES (20-08-2026 — ændret fra "aldrig hvem").
//
// Her stod tidligere at opretteren kun måtte se ANTALLET. Grænsen går et andet sted,
// og det er værd at have skrevet ned: en virksomhed der HAR taget opgaven, har aktivt
// valgt at kontakte hende og har allerede hendes nummer. At hun kan se hvem det er,
// er en forudsætning for at hun kan tage imod opkaldet og vælge mellem dem.
//
// Værnet gælder stadig for alle ANDRE: de matchede virksomheder der ikke har taget
// opgaven, findes slet ikke i svaret. Hun kan ikke samle numre på nogen der ikke selv
// har rakt hånden op.
//
// Kun forretningsinfo — firmanavn, CVR, telefon, mail, kontaktperson. Aldrig interne
// felter som status, kriterier eller abonnement.
// ============================================================================

const GRUNDE = [
  ["fandt_ingen", "Jeg fandt ingen, der kunne"],
  ["for_dyre", "De var for dyre"],
  ["meldte_ikke_tilbage", "De meldte ikke tilbage"],
  ["fandt_selv", "Jeg fandt selv en anden vej"],
  ["andet", "Andet"],
];

// Fornavn til knapteksten: "Ring til Peter" er en anden handling end "Ring".
// Mangler navnet, staar der bare "Ring" - aldrig "Ring til undefined".
function fornavnAf(navn) {
  const f = String(navn || "").trim().split(/\s+/)[0];
  return f || null;
}

const STATUS = {
  aktiv: ["aktiv", "Aktiv"],
  match_fuldfoert: ["fuld", "Match fuldført"],
  lukket_loest: ["lukket", "Løst"],
  udloebet: ["lukket", "Udløbet"],
  lukket_fandt_ingen: ["lukket", "Lukket"],
};

export default function MinOpgaveListe({ token }) {
  const [data, setData] = useState(null);
  const [fejl, setFejl] = useState("");
  const [travl, setTravl] = useState("");
  const [grundFor, setGrundFor] = useState(null);
  const [grund, setGrund] = useState("fandt_ingen");

  const hent = useCallback(async () => {
    try {
      setData(await hentMinListe(token));
      setFejl("");
    } catch (e) {
      setFejl(e.kode === "link_udloebet" ? "udloebet" : e.kode === "ukendt_link" ? "ukendt" : "fejl");
    }
  }, [token]);

  useEffect(() => { hent(); }, [hent]);

  async function handling(fn, id) {
    setTravl(id);
    try { await fn(); await hent(); setGrundFor(null); }
    catch (e) { setFejl(e.kode === "link_udloebet" ? "udloebet" : "fejl"); }
    finally { setTravl(""); }
  }

  if (fejl === "udloebet") {
    return (
      <Ramme>
        <div className="pl-kort" style={{ textAlign: "center" }}>
          <h2>Linket er udløbet</h2>
          <p className="pl-besk">
            Dit link virker, så længe du har en aktiv opgave — og et døgn efter den sidste
            er lukket. Skal du have lavet noget nyt, kan du oprette en opgave igen, så får
            du et nyt link.
          </p>
          <Link href="/opret-opgave" className="pl-btn" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
            Opret en ny opgave
          </Link>
        </div>
      </Ramme>
    );
  }
  if (fejl === "ukendt") return <Ramme><div className="pl-kort" style={{ textAlign: "center" }}><h2>Linket virker ikke</h2><p className="pl-besk">Prøv at åbne linket direkte fra den SMS eller mail, du har fået fra Birdly.</p></div></Ramme>;
  if (!data && !fejl) return <Ramme><div className="pl-henter">Henter dine opgaver …</div></Ramme>;
  if (!data) return <Ramme><div className="pl-kort" style={{ textAlign: "center" }}><h2>Noget gik galt</h2><p className="pl-besk">Prøv at genindlæse siden.</p></div></Ramme>;

  const aktive = data.opgaver.filter((o) => o.status === "aktiv" || o.status === "match_fuldfoert");

  return (
    <Ramme>
      {/* Kvittering efter en rettelse — ellers ser hun bare listen igen og ved ikke
          om det blev gemt. */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("rettet") === "1" && (
        <div className="pl-rettet">✓ Din opgave er rettet.</div>
      )}
      <h1 className="pl-h1">Dine opgaver</h1>
      <p className="pl-besk" style={{ marginBottom: 6 }}>
        {aktive.length === 0
          ? "Du har ingen aktive opgaver lige nu."
          : `Du har ${aktive.length} ${aktive.length === 1 ? "aktiv opgave" : "aktive opgaver"}.`}
      </p>

      {data.opgaver.map((o) => {
        const [klasse, etiket] = STATUS[o.status] || ["lukket", o.status];
        const kanLukke = o.status === "aktiv" || o.status === "match_fuldfoert";
        return (
          <div className="pl-opg" key={o.id}>
            <div className="pl-opg-top">
              <div className="pl-opg-fag">{o.fag?.join(", ") || "Opgave"}{o.postnr ? ` · ${o.postnr}` : ""}</div>
              <span className={"pl-status " + klasse}>{etiket}</span>
            </div>
            <div className="pl-opg-besk">{o.beskrivelse}</div>

            {/* ⚠️ "SAGT JA", IKKE "TAGET OPGAVEN". Ingen af dem har nødvendigvis
                fået arbejdet endnu — de har sagt ja til at kontakte hende. Den gamle
                ordlyd lød som om opgaven allerede var uddelt, og det er den ikke.
                Anden linje siger hvad der SKER nu, så hun ved at bolden er hos dem. */}
            <div className="pl-opg-pladser">
              {o.pladser.taget === 0 ? (
                <span>Ingen virksomheder har sagt ja endnu</span>
              ) : (
                <>
                  <div className="pl-ja">
                    <b>{o.pladser.taget} {o.pladser.taget === 1 ? "virksomhed har" : "virksomheder har"} sagt ja til din opgave</b>
                    <span className="pl-ja-flueben" aria-hidden="true">✓</span>
                  </div>
                  <div className="pl-opg-besk" style={{ marginTop: 2 }}>
                    De har fået dine kontaktoplysninger og kan nu kontakte dig.
                  </div>
                </>
              )}
              {o.status === "aktiv" && o.udloeber_at && (
                <div className="pl-opg-besk" style={{ marginTop: 6 }}>
                  Aktiv indtil {new Date(o.udloeber_at).toLocaleDateString("da-DK", { day: "numeric", month: "long" })}
                </div>
              )}
            </div>

            {/* ---------- VISITKORT ---------- */}
            {(o.virksomheder || []).length > 0 && (
              <div className="pl-visitkort">
                {/* ⚠️ MÅLET ER KONTAKT, IKKE AT STUDERE KORTET. Før stod nummeret og
                    mailen som tekstlinjer, hun selv skulle ramme med fingeren. Nu er de
                    to knapper. Nummeret vises stadig — men som sekundær linje, ikke som
                    det visuelt tungeste. */}
                {o.virksomheder.map((v) => (
                  <div className="pl-vk" key={v.plads}>
                    <div className="pl-vk-top">
                      <div className="pl-vk-navn">{v.firma || "Virksomhed"}</div>
                      <span className="pl-vk-plads">{v.plads} af {o.pladser.i_alt}</span>
                    </div>
                    {v.kontakt && <div className="pl-vk-person">{v.kontakt}</div>}
                    <div className="pl-vk-knapper">
                      {v.telefon && (
                        <a className="pl-vk-btn ring" href={`tel:${v.telefon}`}>
                          <span aria-hidden="true">📞</span> Ring{fornavnAf(v.kontakt) ? ` til ${fornavnAf(v.kontakt)}` : ""}
                        </a>
                      )}
                      {v.email && (
                        <a className="pl-vk-btn" href={`mailto:${v.email}`}>
                          <span aria-hidden="true">✉️</span> Send e-mail
                        </a>
                      )}
                    </div>
                    <div className="pl-vk-sekundaer">
                      {v.telefon && <a href={`tel:${v.telefon}`}>{v.telefon}</a>}
                      {v.cvr && <span>CVR {v.cvr}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {grundFor === o.id ? (
              <div style={{ marginTop: 12 }}>
                <div className="pl-fjern-hj">Hvorfor fandt du ikke den rette hjælp?</div>
                {GRUNDE.map(([k, t]) => (
                  <label key={k} className={"st-omrk" + (grund === k ? " on" : "")} style={{ marginBottom: 8 }}>
                    <input type="radio" name={"g" + o.id} checked={grund === k} onChange={() => setGrund(k)} />
                    <span><b>{t}</b></span>
                  </label>
                ))}
                <div className="pl-opg-handling">
                  <button className="pl-mini primaer" disabled={travl === o.id}
                    onClick={() => handling(() => opgaveIkkeLoest(token, o.id, grund), o.id)}>
                    {travl === o.id ? "Gemmer …" : "Luk opgaven"}
                  </button>
                  <button className="pl-mini" onClick={() => setGrundFor(null)}>Fortryd</button>
                </div>
              </div>
            ) : (
              <>
                {/* ⚠️ HIERARKIET ER VENDT. Før stod tre knapper side om side, alle lige
                    tunge: rediger, løst, ikke løst. Men hun har måske lige fået tre
                    virksomheder — den primære handling er at TAGE IMOD kontakt, ikke at
                    administrere. Rediger er nedtonet til en tekstlink-agtig knap, og
                    afslutningen er flyttet ned under sin egen overskrift. */}
                {kanLukke && (
                  <>
                    <div className="pl-opg-handling">
                      {/* ⚠️ ÅBNER SAMME FORMULAR SOM /opret-opgave, forudfyldt. Ikke en
                          redigerings-kopi: to formularer for det samme ville drive fra
                          hinanden, og så kunne hun rette i noget hun ikke kunne oprette. */}
                      <Link className="pl-mini daempet" href={`/opgave/${token}/rediger/${o.id}`}>
                        Rediger opgave
                      </Link>
                    </div>

                    <div className="pl-afslut">
                      <div className="pl-afslut-h">Er du færdig med opgaven?</div>
                      <button className="pl-mini primaer" disabled={travl === o.id}
                        onClick={() => handling(() => opgaveLoest(token, o.id), o.id)}>
                        ✓ Opgaven er løst
                      </button>
                      {/* ⚠️ "Jeg fandt ikke den rette hjælp", IKKE "Opgaven blev ikke
                          løst". Det gamle kunne betyde ti ting — udsat, for dyrt, ingen
                          meldte tilbage — og gjorde svaret ubrugeligt som data. Det nye
                          siger hvad der faktisk skete, og grunden spørges bagefter. */}
                      <button className="pl-mini daempet" onClick={() => { setGrundFor(o.id); setGrund("fandt_ingen"); }}>
                        Jeg fandt ikke den rette hjælp
                      </button>
                    </div>
                  </>
                )}

                {/* ⚠️ "Find nye virksomheder", IKKE "Genaktivér i 3 dage". Genaktivere
                    hvad? Hendes behov er ikke at forlænge en periode — det er at få nogen
                    andre. Kun teksten er ny: knappen kalder samme genåbnings-mekanisme,
                    med samme loft på antal genåbninger. */}
                {o.kan_genaabne && (
                  <div className="pl-afslut">
                    <div className="pl-afslut-h">Fik du ikke den rette hjælp?</div>
                    <button className="pl-mini primaer" disabled={travl === o.id}
                      onClick={() => handling(() => genaabnOpgave(token, o.id), o.id)}>
                      {travl === o.id ? "Søger …" : "Find nye virksomheder"}
                    </button>
                    <div className="pl-opg-besk" style={{ marginTop: 6 }}>
                      Vi forsøger at finde nye virksomheder til din opgave.
                    </div>
                  </div>
                )}
                {o.status === "udloebet" && !o.kan_genaabne && (
                  <div className="pl-opg-besk" style={{ marginTop: 10 }}>
                    Vi kan ikke søge efter nye virksomheder til denne opgave igen.
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {fejl === "fejl" && <div className="st-fejl" style={{ marginTop: 14 }}>Noget gik galt. Prøv igen.</div>}

      {/* ⚠️ TEKSTEN ER IKKE SLETTET — DEN ER FOLDET SAMMEN. Den fulde ordlyd står
          uændret bag "Se vilkår" (samme kilde, lib/formidlerTekst.js), så den stadig
          er tilgængelig; kun vægten på skærmen er skåret ned. Et langt juridisk afsnit
          nederst på en mobilside bliver alligevel ikke læst — en linje hun forstår,
          plus vejen til resten, er mere ærligt end en mur ingen scroller forbi.
          <details> frem for et modal: den virker uden JavaScript og kan søges i. */}
      <details className="pl-vilkaar">
        <summary>
          Birdly formidler kontakten – aftalen indgås direkte mellem dig og virksomheden.{" "}
          <span className="pl-vilkaar-link">Se vilkår</span>
        </summary>
        <p className="pl-note">{FORMIDLER_TEKST}</p>
        <p className="pl-note" style={{ marginTop: 8 }}>
          <Link href="/betingelser-private-opgaver">Betingelser for private opgaver</Link>
        </p>
      </details>
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
