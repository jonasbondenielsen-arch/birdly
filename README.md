# Birdly — offentlig hjemmeside

Marketing-/forside for [birdly.dk](https://birdly.dk). Next.js (App Router, plain JS) deployet på Vercel.

> Dette er det **offentlige** miljø. Ingen hemmeligheder her — kun den offentlige side.
> Admin, backend, betalings-webhooks og AI-agent (Hermes) ligger i et separat, privat repo (`birdly-admin` → `admin.birdly.dk`).

## Ruter
- `/` — forsiden
- `/tilmeld` — opret profil / tilmelding
- `/handelsbetingelser`, `/privatlivspolitik` — placeholders (indhold kommer i Etape 5)

## Udvikling
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produktionsbuild
```

## Struktur
- `app/` — ruter, layout og global/scoped CSS (`globals.css`, `forside.css`, `tilmeld.css`, `legal.css`)
- `components/` — `Forside.js`, `Tilmeld.js`, `LegalPlaceholder.js`

Designet er en tro (1:1) port af de oprindelige HTML-designfiler — markup, farver, fonte (Plus Jakarta Sans + Inter + Caveat), layout og animationer er bevaret. De to siders CSS er scoped under `.birdly-home` / `.birdly-tilmeld`, så de ikke kolliderer.

## Status
Etape 1: faithful port + deploy. Ingen backend endnu — tilmeldings-, opsigelses- og chat-flows kører som frontend-placeholders, indtil Supabase/agent kobles på i senere etaper.
