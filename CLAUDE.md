# CLAUDE.md — birdly (offentlig side)

> Dette er det **kundevendte** repo. Admin, ingest, match og notify ligger i søster-repoet
> `birdly-admin`, som har sin egen CLAUDE.md med den fulde projektkontekst. Læs den hvis
> opgaven rører data, match eller udsendelser.

## Hvad dette repo er

Den offentlige side på **www.birdly.dk**: forside, brancheshelf, tilmeldings-funnel,
kundens samleside, deleside pr. udbud og bud-skabelonen. Deploy: Vercel-projekt `birdly`.

## Stack (ikke til forhandling)

- **Next.js App Router med plain JavaScript — ALDRIG TypeScript.**
- Kun **anon-nøglen**. Al privilegeret adgang går gennem Edge Functions i `birdly-admin`
  (service-role internt). Læg ALDRIG en service-nøgle i dette repo.
- Styling: håndskrevet CSS pr. område (`app/forside.css`, `udbud.css`, `tilmeld.css` …)
  + `globals.css`. Ingen CSS-framework.

## Ufravigelige regler

- **Secrets kun i Vercel env + `.env.local` (gitignored).** Aldrig i chat, aldrig i git.
- **Token-sider er `noindex`.** `/mine-opgaver/[token]`, `/udbud/[token]`, `/u/[code]` og
  skabelonen må ALDRIG i søgeresultater.
- **Vis aldrig `esender`** til kunden — det kan være en konkurrent (fx Mercell). Køber er
  den ægte ordregiver.
- **Deploy sker manuelt:** `vercel --prod` fra repo-mappen (projektet er linket).
  Auto-deploy fra GitHub virker, men bekræft ALTID at et push faktisk gav et deployment.
- **Rør ikke samlesidens logik uden grund.** `components/MineOpgaver.js` er live for
  betalende kunder; dedupe, adgangs-spærring og "Nyt"-badget hænger sammen med
  Edge Functions i `birdly-admin`.

## Sprog og SEO (besluttet 27-07-2026)

- **Al synlig benefit-tekst siger "opgaver"** — ikke "udbud". Gælder ALLE sider og
  undersider. Grammatik: "**en** opgave", "opgaven", "opgaverne".
- **SEO-laget beholder "udbud":** `title`, `description`, slugs (`/udbud-for-alle`,
  `/udbud/[token]`, `/dagens-udbud`), alt-tekster og structured data. Målet er at ranke
  på både "udbud", "offentlige udbud" OG "offentlige opgaver". **Rør ikke slugs.**
- **"udbud" bevares bevidst** hvor det er teknisk korrekt eller bærer søgeordet:
  "tusindvis af udbud" (mængde-kontrasten), FAQ-svaret "Hvor kommer opgaverne fra?",
  `udbudsportal(er)` om konkurrenten, `udbudsmateriale`, `udbudsdatabase`,
  `udbudssystem`, `udbudsafdeling`.
- **Ejer-sætningen** går igen to steder og skal blive stående:
  > Du fortæller os, hvilke opgaver du leder efter. Vi holder øje. Du får besked.
- **Én CTA gennem hele funnelen:** hver knap der fører til `/tilmeld` hedder **"Kom i gang nu"**
  (14 stk.). Under de fire store står noten *"Gratis de første 14 dage · ingen binding"*.
  Knapper med ANDEN funktion holdes tydeligt forskellige ("Se hvordan det virker",
  "Se opgaven", opsigelsen) — de må aldrig laves om til "Kom i gang nu".
- **Tone:** rolig, ærlig, dansk, du-form. Ingen hype, ingen AI-/algoritme-jargon —
  skriv "vi holder øje".

## Pris — REGLERNE

- **`lib/pakke.js` er enekilden i dette repo.** `PLAN.monthly` / `PLAN.yearly` fodrer
  `priceText`, `YEARLY_SAVING` og `planForInterval`. **Hardkod ALDRIG et beløb i en
  komponent** — netop det var grunden til at tre steder (chatbot ×2 + FAQ) stod med den
  gamle pris efter en ændring. De er nu bundet til `priceText`; hold dem der.
- **Frisbii er den AUTORITATIVE priskilde, ikke koden.** Rækkefølgen er ufravigelig: ret i
  Frisbii FØRST, derefter `lib/pakke.js`, `prices`-tabellen (migration i admin) og
  handelsbetingelsernes §3.1. Står de forskelligt, viser vi én pris og opkræver en anden —
  markedsføringslovs- og aftaleretlig fælde.
- **B2B ⇒ kun EX MOMS kundevendt.** Birdly sælger kun til virksomheder; køber trækker
  momsen fra, så et inkl.-tal får prisen til at se højere ud end den reelle omkostning.
  Vis aldrig inkl. moms som den fremhævede pris. Momsen forsvinder ikke juridisk: Frisbii
  specificerer den på fakturaen, og handelsbetingelsernes §3.2 og §5.1 oplyser allerede at
  priser er ekskl. moms.
- **Eksisterende kunder flyttes ikke ved en prisændring** (§5.4, varsel). De bliver på
  deres gamle Frisbii-planversion. Derfor er den viste pris kun gyldig for NYE
  tilmeldinger — og derfor regner admin MRR på hvad kunden faktisk betaler, ikke på det
  tal der står her.
- Pr. 27-07-2026: **499 kr./md.** / **4.990 kr./år** ex moms. Besparelsen (998 kr, ~17 %,
  "betal for 10 måneder, få 12") beregnes af `YEARLY_SAVING` — skriv den aldrig som tekst.

## Design

- **Copy-opgaver må ALDRIG ændre struktur, layout, grafik, farver, typografi eller spacing.**
  Nye sektioner bygges med de EKSISTERENDE komponenter (`section` → `wrap` →
  `center reveal` → `big`/`lead`) og design-tokens, så de ser native ud.
- Brand: navy `#0D274A`, sky `#2EB7FF`, teal `#00B3A6`, lys sky `#EAF6FF`, koral `#FF6B6B`.
  Fonte: Plus Jakarta Sans (overskrifter) + Inter (brød).
- Verificér ændringer ved at tælle komponenter før/efter (`vcard`, `pcard`, `pbox`,
  `section`) — det fanger utilsigtet strukturskade bedre end et skærmbillede.

## Aktuel status (27-07-2026)

- **Samlesiden `/mine-opgaver/[token]` er LIVE** med relevans-sortering, "Nyt"-badge,
  "Sortér i opgaver", spærret-tilstand og valgfri fravalgsgrund.
- **`/u/[code]`** kender `kind:"list"` → `/mine-opgaver/{token}` og `kind:"notice"` →
  `/udbud/{token}`.
- **Forside-copy** omlagt til "opgaver" med bevaret SEO-lag; to nye sektioner
  ("Slip for selv at holde øje…", "Du skal ikke finde flere opgaver…") og
  "Derfor er Birdly anderledes" i det eksisterende 4-korts-grid.
- **Launch-mode** styres af `NEXT_PUBLIC_LAUNCH_DEADLINE`.

- **Samleside-widget er LIVE** (fase 1, Byg 1): fire strukturerede grunde
  (`forkert_fag` · `forkert_omraade` · `forkert_stoerrelse` · `ikke_nu`) + valgfri 1-5
  smiley, i to trin i samme række. Grunden gemmes straks; smileyen er frivillig og
  rækken lukker uanset. Begge kald må fejle uden at røre listen — fjernelsen sker FØR.
  "For stor"/"For lille" er bevidst ÉN knap: retningen udleder serveren af det beløb den
  snapshotter (`birdly-admin` migration 0044).
- **Intern-markør:** `?intern=<signatur>` på `/mine-opgaver/[token]` og `/udbud/[token]`
  er admins supportvisning. Dette repo hverken laver eller forstår markøren — den
  **videresendes ordret**, og Edge Function'en afgør om den er ægte. Uden markør er alt
  nøjagtig som før. Husk at føre den med når du tilføjer nye kald til `fetchMyTasks` /
  `fetchSharedNotice`, ellers spores et supportbesøg alligevel.

## Fase 2 — "lagt til side"-bunken: REGLERNE for dette repo

Samlesiden viser to bunker: `opgaver` (hovedliste) og `lagt_til_side`. **Serveren afgør
ALT** — hvad der ligger hvor, og hvorfor.

- **Klassificér ALDRIG i dette repo.** Reglen bor i SQL (`birdly_skjul_kandidater`, 0047) og
  kaldes af `get-my-tasks`. En kopi her ville drive fra serverens og vise kunden noget andet
  end det notify regner med. Repoet har kun anon-nøglen og kan alligevel ikke slå
  learned_filters, regioner eller CPV-navne op.
- **Skriv aldrig "hvorfor"-teksten her.** Den kommer færdig som `hvorfor_tekst[]` og beskriver
  det træk der **faktisk** skjulte opgaven. Bygger du den selv af `hvorfor[]`, risikerer du at
  nævne et træk som guldklump-værnet netop reddede opgaven fra — og så lyver forklaringen.
- **Knappen skal altid vise tallet** når bunken ikke er tom. Intet må være skjult uden at
  kunden kan se at det findes og hvor meget.
- **Tom `lagt_til_side` ⇒ hele afsnittet renderes ikke.** Sådan er leveret-tilstanden i dag
  (`SKJUL_AKTIVT = false` i admin), og siden er da identisk med før fase 2. Hvis du ser
  bunken dukke op uden at gaten er passeret, er noget galt.
- **"Dette er relevant"** flytter opgaven op i hovedlisten med det samme og kalder
  `action:"relevant"`. Kaldet må fejle uden at rulle flytningen tilbage — kunden skal se at
  vi lyttede, ikke vente på serveren.

### Næste i dette repo
- **Mobilvisning af de nye forside-sektioner er IKKE verificeret visuelt.**
- **Widget'ens to trin er ikke set på mobil** — knapperne wrapper i en flexbox-række.
