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
// ⚠️ INGEN AF KNAPPERNE VISER KONTAKTOPLYSNINGER PÅ VIRKSOMHEDERNE. Opretteren ser
// HVOR MANGE der har taget opgaven, ikke hvem — de ringer selv. Ellers ville hun
// kunne samle numre uden at nogen havde sagt ja til det.
// ============================================================================

const GRUNDE = [
  ["fandt_ingen", "Jeg fandt ingen, der kunne"],
  ["for_dyre", "De var for dyre"],
  ["meldte_ikke_tilbage", "De meldte ikke tilbage"],
  ["fandt_selv", "Jeg fandt selv en anden vej"],
  ["andet", "Andet"],
];

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

            <div className="pl-opg-pladser">
              {/* Antal, aldrig hvem. Se noten øverst. */}
              <b>{o.pladser.taget} af {o.pladser.i_alt}</b>{" "}
              {o.pladser.taget === 0
                ? "virksomheder har taget opgaven endnu"
                : o.pladser.taget === 1
                ? "virksomhed har taget opgaven"
                : "virksomheder har taget opgaven"}
              {o.status === "aktiv" && o.udloeber_at && (
                <div className="pl-opg-besk" style={{ marginTop: 4 }}>
                  Aktiv indtil {new Date(o.udloeber_at).toLocaleDateString("da-DK", { day: "numeric", month: "long" })}
                </div>
              )}
            </div>

            {grundFor === o.id ? (
              <div style={{ marginTop: 12 }}>
                <div className="pl-fjern-hj">Hvorfor blev den ikke løst?</div>
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
              <div className="pl-opg-handling">
                {kanLukke && (
                  <>
                    <button className="pl-mini primaer" disabled={travl === o.id}
                      onClick={() => handling(() => opgaveLoest(token, o.id), o.id)}>
                      Opgaven er løst
                    </button>
                    <button className="pl-mini" onClick={() => { setGrundFor(o.id); setGrund("fandt_ingen"); }}>
                      Opgaven blev ikke løst
                    </button>
                  </>
                )}
                {o.kan_genaabne && (
                  <button className="pl-mini primaer" disabled={travl === o.id}
                    onClick={() => handling(() => genaabnOpgave(token, o.id), o.id)}>
                    {travl === o.id ? "Åbner …" : "Genaktivér i 3 dage"}
                  </button>
                )}
                {o.status === "udloebet" && !o.kan_genaabne && (
                  <span className="pl-opg-besk">Opgaven kan ikke genaktiveres flere gange.</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {fejl === "fejl" && <div className="st-fejl" style={{ marginTop: 14 }}>Noget gik galt. Prøv igen.</div>}

      {/* ⚠️ SAMME ORDLYD SOM VED OPRETTELSEN — én kilde, se lib/formidlerTekst.js. */}
      <p className="pl-note" style={{ marginTop: 20 }}>{FORMIDLER_TEKST}</p>
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
