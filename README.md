# Din Låsesmed

Website til [Din Låsesmed](https://din-laasesmed.dk), bygget med Next.js og Payload CMS. Indholdet er importeret fra en tidligere Webflow-side og lagt om til en blok-baseret CMS-struktur, så sider kan sættes sammen af genbrugelige sektioner (hero, kundeudtalelser, jobopslag, kontaktformular m.fl.).

## Teknologier
- [Next.js](https://nextjs.org) (App Router)
- [Payload CMS](https://payloadcms.com) (headless, blok-baseret sideopbygning)
- MongoDB
- AWS S3 til mediefiler
- Tailwind CSS

## Kør lokalt
```bash
pnpm install
```

Kopiér `.env.example` til `.env.local` og udfyld databaseforbindelse og S3-nøgler.

```bash
pnpm dev
```

Åbn [http://localhost:3456](http://localhost:3456) for frontend og `/admin` for Payloads admin-panel.

## Scripts
| Kommando | Beskrivelse |
| --- | --- |
| `pnpm dev` | Starter dev-server på port 3456 |
| `pnpm build` | Bygger til produktion |
| `pnpm start` | Kører den byggede app |
| `pnpm lint` | Linter kodebasen |
| `pnpm generate:types` | Genererer TypeScript-typer ud fra Payload-collections |
| `pnpm generate:importmap` | Genererer Payloads importmap til admin-panelet |
| `pnpm check:spacing` | Tjekker spacing-konsistens i blokke |
| `pnpm seed` | Seeder databasen med testdata |
| `pnpm import:webflow` | Importerer indhold fra den gamle Webflow-side |
