"use client";

import { useEffect, useState } from "react";
import OpretOpgave from "./OpretOpgave";
import { hentTilRedigering } from "../lib/privatOpgave";
import "../app/privat-lead.css";

// ============================================================================
// /opgave/[token]/rediger/[id]
//
// ⚠️ HENTER FØRST, RENDERER SÅ. Formularen forudfylder sin state ÉN gang ved mount
// (useState-initialisering), så den skal have data FØR den monteres. Renderede vi den
// med tomme felter og fyldte dem bagefter, ville hendes tekst blive overskrevet
// midt i at hun skrev.
//
// ⚠️ SAMME FORMULAR SOM /opret-opgave — ikke en kopi. Se noten i OpretOpgave.
// ============================================================================

export default function RedigerOpgave({ listToken, opgaveId }) {
  const [opgave, setOpgave] = useState(null);
  const [fejl, setFejl] = useState("");

  useEffect(() => {
    hentTilRedigering(listToken, opgaveId)
      .then((r) => setOpgave(r.opgave))
      .catch((e) =>
        setFejl(
          e.kode === "link_udloebet" ? "udloebet"
          : e.kode === "ukendt_opgave" ? "ukendt"
          : "fejl"
        )
      );
  }, [listToken, opgaveId]);

  if (fejl) {
    return (
      <div className="pl">
        <main className="pl-wrap">
          <div className="pl-kort" style={{ textAlign: "center" }}>
            <h2>
              {fejl === "udloebet" ? "Linket er udløbet"
                : fejl === "ukendt" ? "Opgaven findes ikke"
                : "Noget gik galt"}
            </h2>
            <p className="pl-besk">
              {fejl === "udloebet"
                ? "Dit link virker, så længe du har en aktiv opgave — og et døgn efter den sidste er lukket."
                : "Prøv at åbne linket fra den mail eller SMS, du har fået fra Birdly."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!opgave) {
    return <div className="pl"><main className="pl-wrap"><div className="pl-henter">Henter opgaven …</div></main></div>;
  }

  return <OpretOpgave rediger={{ list_token: listToken, opgave }} />;
}
