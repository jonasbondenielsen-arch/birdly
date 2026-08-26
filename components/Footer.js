import Link from "next/link";
import { BirdMark } from "./Logo";
import SamtykkeLink from "./SamtykkeLink";
import { SOCIALE } from "../lib/social";

// SVG'erne er de samme som før — kun deres href har ændret sig.
const IKON = {
  facebook: (<svg width="17" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.3 1.4-1.3h1.4V5.6c-.7-.1-1.4-.1-2.1-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.5V14h2.3v7z" /></svg>),
  instagram: (<svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none" /></svg>),
  google: (<svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 12a8 8 0 10-2.4 5.7" strokeLinecap="round" /><path d="M20.5 12H13" strokeLinecap="round" /></svg>),
  trustpilot: (<svg width="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" /></svg>),
};
import "../app/footer.css";
import { KLARE_GUIDES } from "../lib/viden";

// Én kilde: samme betingelse som /viden selv bruger til at være indekserbar.
const VIDEN_KLAR = KLARE_GUIDES.length > 0;

/* Delt footer — kompakt og centreret: alle navigations-links i én vandret,
   centreret række øverst, en tynd skillelinje, og nederst tre zoner (logo +
   Juridisk til venstre, firmaoplysninger i midten, sociale ikoner til højre).
   Sociale URL'er er PLADSHOLDERE indtil Jonas leverer dem. Firmaoplysninger:
   enkeltmandsvirksomhed (ingen "ApS", intet registreringsnummer). */
export default function Footer() {
  return (
    <footer className="birdly-footer">
      <div className="finner">
        {/* Øverst: alle links i én centreret, wrappende række */}
        <nav className="flinks">
          <a href="/#hvorfor">Hvorfor Birdly</a>
          <a href="/#hvordan">Hvordan virker det</a>
          <a href="/#priser">Priser</a>
          <a href="/#faq">FAQ</a>
          <a href="/#om">Om os</a>
          <Link href="/brancher">For dit fag</Link>
          {/* ⚠️ DET ANDET SPOR. Footeren var indtil nu kun B2B'ens vej rundt
              (hvorfor, hvordan, priser, FAQ, brancher) — alt sammen "find
              offentlige opgaver". En privatperson havde ingen crawlbar vej til
              funnelen uden om nav-knappen, og ét link pr. side er tyndt signal til
              Google om at siden hører til her. Ordlyden er handlingen, ikke et
              produktnavn. */}
          <Link href="/opret-opgave">Opret en opgave</Link>
          {/* ⚠️ DISKRET, OG KUN NÅR DER ER NOGET AT LÆSE. /viden hører ikke hjemme i
              hovedmenuen — den er købsrejsen. Guides er noget man lander på fra en
              søgning, og footeren er nok til at Google og den interne linkstruktur
              finder dem. Linket vises først når mindst én guide er publiceret, saa
              vi ikke sender folk hen til en tom side. */}
          {VIDEN_KLAR && <Link href="/viden">Viden</Link>}
          <Link href="/udbud-for-alle">Opgaver er for alle</Link>
          <a href="/#opsigelse">Opsigelse</a>
        </nav>

        <div className="fdiv" />

        {/* Nederst: tre zoner */}
        <div className="fbottom">
          <div className="fleft">
            <Link href="/" className="fmark" aria-label="Birdly forside">
              <BirdMark size={30} />
              <span>Birdly<span className="dk">.dk</span></span>
            </Link>
            <div className="fjur">
              <b>Juridisk</b>
              <Link href="/betingelser">Betingelser &amp; sikkerhed</Link>
              <SamtykkeLink />
            </div>
          </div>

          <div className="fcompany">
            Birdly.dk · CVR 35764283 · Fjordvej 4, 4300 Holbæk<br />
            <a href="mailto:hello@birdly.dk">hello@birdly.dk</a>
          </div>

          {/* ⚠️ IKONERNE VISES KUN NÅR ADRESSEN FINDES. Her stod tidligere fire
              rå placeholdere — [FACEBOOK-URL] og tre lignende — og fordi de ikke
              starter med http, læste browseren dem som relative stier: et klik
              landede på birdly.dk/[FACEBOOK-URL]. Verificeret 404 på alle fire,
              live, på hver eneste side med footer.

              Adresserne sættes nu i env (se lib/social.js); tomme værdier giver
              intet ikon frem for et dødt et. Hele blokken forsvinder når ingen af
              dem er sat, så footeren ikke står med et tomt hul.

              ⚠️ target="_blank" + rel: eksterne links skal ikke tage brugeren væk
              fra siden, og noopener lukker window.opener-hullet. */}
          {SOCIALE.length > 0 && (
          <div className="fsocial">
            {SOCIALE.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                aria-label={`Birdly på ${s.navn}`}>
                {IKON[s.key]}
              </a>
            ))}
          </div>
          )}
        </div>
      </div>
    </footer>
  );
}
