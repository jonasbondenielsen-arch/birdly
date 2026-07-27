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

### Næste i dette repo
- **Samleside-widget (fase 1, Byg 1):** fire grund-knapper
  (`forkert_fag` · `forkert_omraade` · `forkert_stoerrelse` · `ikke_nu`) + valgfri 1-5
  smiley ved lav vurdering. Skemaet ligger klar i `birdly-admin` (migration 0042);
  Edge Function-handlingen hedder `action:"grund"` i `save-my-criteria`.
- **Mobilvisning af de nye forside-sektioner er IKKE verificeret visuelt.**
