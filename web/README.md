# JustBookMe — Web

Next.js 15 marketing site + signup for [JustBookMe](https://justbookme.ca).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing (FR default, EN toggle) |
| `/pricing` | Plans with monthly/annual toggle |
| `/signup` | 14-day trial signup |

## Quick start

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, waitlist and signup run in **dev mode** (console logging only).

## Supabase setup

1. Create a Supabase project
2. Run `supabase/migrations/001_initial.sql` in SQL editor
3. Copy URL + keys to `.env.local`
4. Enable Email auth in Supabase Dashboard

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |