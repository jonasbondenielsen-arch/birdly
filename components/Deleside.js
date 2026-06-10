import Link from "next/link";
import { Logo } from "./Logo";

// Deleside (Fase D / D1) — den offentlige side token-linket peger på. Server-renderet,
// ingen login. Viser udbuds-resumé + kildeangivelse + links + CTA til bud-skabelonen
// (D2) + DISCLAIMER A. noindex sættes i page.js' metadata.

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("da-DK", { dateStyle: "long" });
}
function fmtBelob(amount, currency) {
  if (amount == null) return "Ikke oplyst";
  return new Intl.NumberFormat("da-DK").format(Math.round(amount)) + (currency ? " " + currency : "");
}
function regionText(notice) {
  if (notice.nationwide) return "Hele landet";
  if (Array.isArray(notice.nuts_codes) && notice.nuts_codes.length) return notice.nuts_codes.join(", ");
  return "—";
}

const WRAP = { maxWidth: 760, margin: "0 auto", padding: "24px 18px 64px" };
const CARD = { background: "#fff", border: "1px solid #E6EAEF", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" };
const ROW = { display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #F0F2F5" };
const LABEL = { flex: "0 0 150px", color: "#6B7785", fontSize: 14 };
const VAL = { flex: 1, fontWeight: 600, fontSize: 15 };

function Field({ label, children }) {
  return (
    <div style={ROW}>
      <div style={LABEL}>{label}</div>
      <div style={VAL}>{children}</div>
    </div>
  );
}

export default function Deleside({ token, data }) {
  // Ugyldigt/udløbet link — pæn tilstand, ingen detaljer lækket.
  if (!data || !data.found) {
    return (
      <main style={{ ...WRAP, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 28px" }}><Logo /></div>
        <div style={CARD}>
          <h1 style={{ fontSize: 22, margin: "4px 0 10px" }}>Linket er ugyldigt eller udløbet</h1>
          <p style={{ color: "#6B7785", lineHeight: 1.6 }}>
            {data?.expired
              ? "Dette link er udløbet. Kontakt os, hvis du stadig vil byde på udbuddet."
              : "Vi kunne ikke finde udbuddet bag dette link. Tjek at du har kopieret hele linket."}
          </p>
          <p style={{ marginTop: 18 }}><Link href="https://birdly.dk" style={{ color: "#1E9E8A", fontWeight: 600 }}>Til birdly.dk</Link></p>
        </div>
      </main>
    );
  }

  const { notice, customer } = data;
  return (
    <main style={WRAP}>
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 22px" }}><Logo /></div>

      {customer?.company_name && (
        <p style={{ textAlign: "center", color: "#6B7785", marginBottom: 14 }}>
          Forberedt til <b style={{ color: "#1B2733" }}>{customer.company_name}</b>{customer.cvr ? ` · CVR ${customer.cvr}` : ""}
        </p>
      )}

      <div style={CARD}>
        <div style={{ fontSize: 13, color: "#1E9E8A", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Relevant udbud</div>
        <h1 style={{ fontSize: 24, lineHeight: 1.3, margin: "8px 0 6px" }}>{notice.title || "Udbud"}</h1>
        {notice.publication_number && <div style={{ color: "#9AA5B1", fontSize: 13, marginBottom: 8 }}>TED {notice.publication_number}</div>}

        <Field label="Ordregiver">{notice.buyer_name || "—"}{notice.contact_person ? <span style={{ fontWeight: 400, color: "#6B7785" }}> · Kontakt: {notice.contact_person}</span> : null}</Field>
        <Field label="Frist">{fmtDate(notice.deadline)}</Field>
        <Field label="Anslået beløb">{fmtBelob(notice.amount, notice.currency)}</Field>
        <Field label="Område">{notice.cpv_main_name || notice.cpv_main || "—"}{Array.isArray(notice.cpv_codes) && notice.cpv_codes.length > 1 ? <span style={{ fontWeight: 400, color: "#6B7785" }}> +{notice.cpv_codes.length - 1} CPV</span> : null}</Field>
        <Field label="Geografi">{regionText(notice)}</Field>
        {notice.duration_text && <Field label="Varighed">{notice.duration_text}</Field>}
        {notice.suitable_for_sme === true && <Field label="SMV-egnet">Ja — egnet for små og mellemstore virksomheder</Field>}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          {notice.source_url && <a href={notice.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#1B2733", fontWeight: 600, border: "1px solid #CBD2DA", borderRadius: 10, padding: "10px 16px", textDecoration: "none" }}>Se på TED ↗</a>}
          {notice.submission_url && <a href={notice.submission_url} target="_blank" rel="noopener noreferrer" style={{ color: "#1B2733", fontWeight: 600, border: "1px solid #CBD2DA", borderRadius: 10, padding: "10px 16px", textDecoration: "none" }}>Afgiv tilbud her ↗</a>}
        </div>
        <p style={{ color: "#9AA5B1", fontSize: 12, marginTop: 12 }}>Kilde: TED (Tenders Electronic Daily), EU's officielle udbudsdatabase. Birdly viderebringer offentligt tilgængelige udbudsdata.</p>
      </div>

      {/* Fremhævet CTA */}
      <div style={{ ...CARD, marginTop: 18, background: "#F2FBF9", borderColor: "#BfE9E0" }}>
        <h2 style={{ fontSize: 19, margin: "0 0 8px" }}>Vil du byde på dette udbud?</h2>
        <p style={{ color: "#41505E", lineHeight: 1.6, margin: "0 0 16px" }}>
          Birdly har allerede forberedt det meste af tilbuddet for dig — du udfylder kun det, vi ikke kan vide.
        </p>
        <Link href={`/udbud/${token}/skabelon`} style={{ display: "inline-block", background: "#1E9E8A", color: "#fff", fontWeight: 700, borderRadius: 12, padding: "13px 22px", textDecoration: "none" }}>
          Åbn din skabelon →
        </Link>
      </div>

      {/* DISCLAIMER A */}
      <div style={{ marginTop: 18, padding: "16px 18px", background: "#FBFCFD", border: "1px solid #E6EAEF", borderRadius: 12, color: "#6B7785", fontSize: 13, lineHeight: 1.6 }}>
        <b style={{ color: "#41505E" }}>Vigtigt</b>
        <p style={{ margin: "6px 0 0" }}>
          Birdly hjælper dig i gang med dit tilbud ved at forudfylde de oplysninger, vi kan udlede fra udbuddet og fra
          offentligt tilgængelige data. Skabelonen er et hjælpeværktøj og et udkast — ikke en færdig eller fyldestgørende
          tilbudsløsning. Du er selv ansvarlig for at læse hele det officielle udbudsmateriale og sikre, at dit tilbud
          opfylder samtlige krav, frister og betingelser. Birdly er ikke ansvarlig for tilbuddets fuldstændighed eller for
          udfaldet af din deltagelse.
        </p>
      </div>
    </main>
  );
}
