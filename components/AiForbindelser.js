"use client";

import { useState } from "react";
import { frakoblAi } from "../lib/aiAdgang";

// ⚠️ TO AI'ER, ÉN BAGVED. ChatGPT og Claude er de to Birdly understøtter i V1 —
// men det er den samme forbindelse begge steder. Vejledningerne er forskellige,
// fordi platformene er forskellige; adressen er den samme.
//
// ⚠️ VEJLEDNINGEN NÆVNER AT DET KRÆVER EN BETALT PLAN. Begge platforme har lagt
// custom connectors bag deres betalte niveauer. Skrev vi det ikke, ville kunden
// følge vejledningen til punkt tre og så gå i stå uden at vide hvorfor.
const KLIENTER = [
  {
    navn: "ChatGPT",
    noegle: "chatgpt",
    krav: "Kræver ChatGPT Plus, Pro, Business, Enterprise eller Edu — og skal gøres på web.",
    trin: [
      "Åbn ChatGPT på web og gå til Indstillinger → Apps → Avancerede indstillinger.",
      "Slå udviklertilstand til.",
      "Gå til Indstillinger → Connectors og vælg Opret.",
      "Indsæt Birdly-adressen herunder, og vælg OAuth som login.",
      "Godkend med din Birdly-mail, når vi beder om det.",
    ],
  },
  {
    navn: "Claude",
    noegle: "claude",
    krav: "Kræver Claude Pro, Max, Team eller Enterprise.",
    trin: [
      "Åbn Claude og gå til Indstillinger → Connectors.",
      "Vælg Tilføj brugerdefineret connector.",
      "Indsæt Birdly-adressen herunder.",
      "Godkend med din Birdly-mail, når vi beder om det.",
    ],
  },
];

export default function AiForbindelser({ token, adresse, forbindelser }) {
  const [liste, setListe] = useState(forbindelser);
  const [kopieret, setKopieret] = useState(false);
  // ⚠️ BEKRÆFTELSE FØR FRAKOBLING. Et klik der lukker en adgang uden at spørge,
  // bliver til en supportsag næste gang nogen rammer forkert.
  const [bekraefter, setBekraefter] = useState(null);
  const [fejl, setFejl] = useState("");

  async function kopier() {
    try {
      await navigator.clipboard.writeText(adresse);
      setKopieret(true);
      setTimeout(() => setKopieret(false), 2000);
    } catch { /* kopiering må gerne fejle — adressen står læsbar ved siden af */ }
  }

  async function frakobl(id) {
    setFejl("");
    // ⚠️ RÆKKEN FJERNES FØRST NÅR SERVEREN HAR SAGT JA. Modsat fravalget på
    // samlesiden, hvor vi hellere viser at vi lyttede end venter: her betyder en
    // optimistisk visning at kunden tror adgangen er væk, mens den lever.
    try {
      await frakoblAi(token, id);
      setListe((l) => l.filter((f) => f.id !== id));
      setBekraefter(null);
    } catch (e) {
      setFejl(e.message || "Kunne ikke frakoble. Prøv igen.");
    }
  }

  return (
    <>
      <div className="pbox" style={{ margin: "1.5rem 0" }}>
        <strong>Din Birdly-adresse</strong>
        <p style={{ wordBreak: "break-all", fontFamily: "monospace", margin: ".4rem 0" }}>{adresse}</p>
        <button className="btn btn-teal" onClick={kopier} type="button">
          {kopieret ? "Kopieret ✓" : "Kopiér adresse"}
        </button>
      </div>

      {KLIENTER.map((k) => {
        const aktiv = liste.filter((f) =>
          (f.klient || "").toLowerCase().includes(k.noegle));
        return (
          <section key={k.noegle} className="pcard" style={{ margin: "1.5rem 0" }}>
            <h2>{k.navn}</h2>

            {aktiv.length > 0 ? (
              aktiv.map((f) => (
                <div key={f.id}>
                  <p><strong>Tilknyttet ✓</strong></p>
                  <p>Tilknyttet: {new Date(f.tilknyttet_at).toLocaleDateString("da-DK")}</p>
                  {f.senest_brugt_at && (
                    <p>Senest brugt: {new Date(f.senest_brugt_at).toLocaleDateString("da-DK")}</p>
                  )}
                  <p style={{ marginTop: ".6rem" }}><strong>Adgang:</strong></p>
                  <ul>{f.adgang.map((a) => <li key={a}>✓ {a}</li>)}</ul>

                  {bekraefter === f.id ? (
                    <p>
                      Er du sikker? {k.navn} mister adgangen med det samme.{" "}
                      <button className="btn" type="button" onClick={() => frakobl(f.id)}>Ja, frakobl</button>{" "}
                      <button className="btn" type="button" onClick={() => setBekraefter(null)}>Fortryd</button>
                    </p>
                  ) : (
                    <button className="btn" type="button" onClick={() => setBekraefter(f.id)}>
                      Frakobl {k.navn}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <>
                <p>Ikke tilknyttet</p>
                <p className="lille">{k.krav}</p>
                <ol>{k.trin.map((t) => <li key={t}>{t}</li>)}</ol>
              </>
            )}
          </section>
        );
      })}

      {fejl && <p role="alert">{fejl}</p>}

      <p className="lille">
        Birdly viser kun din egen virksomheds oplysninger. Du kan fjerne en adgang her,
        når som helst, og den holder op med at virke med det samme.
      </p>
    </>
  );
}
