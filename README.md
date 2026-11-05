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
