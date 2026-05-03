# Castle Tours

Standard React + Vite SPA with Vercel Serverless Functions for Wompi payments and Supabase as backend.

## Stack

- **Frontend**: React 19 + Vite 7 + Tailwind CSS 4 + React Router 6
- **Backend**: Vercel Serverless Functions (`/api/*`) on Node 20
- **Database / Auth**: Supabase
- **Payments**: Wompi (Colombia)

No proprietary platform dependencies — clone, `npm install`, `npm run build`, deploy to Vercel.

## Local development

```bash
npm install
cp .env.example .env   # then fill in values
npm run dev            # Vite at http://localhost:8080
```

To run the API routes locally, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

## Build

```bash
npm run build
npm run preview
```

## Project layout

```
api/                     Vercel Serverless Functions (Node 20)
  _lib/                  shared server helpers (supabase admin, wompi)
  create-payment-link.ts POST — admin only, creates Wompi link
  update-booking-status.ts POST — admin only
  wompi-webhook.ts       POST — Wompi event receiver (signature-verified)
src/
  pages/                 route components
  components/, features/ UI
  integrations/supabase/ generated client + types
  lib/                   i18n, whatsapp, utils
vercel.json              SPA rewrites
vite.config.ts           Vite + Tailwind + tsconfig paths
```

## Environment variables

See `.env.example`. On Vercel, configure them under **Project Settings → Environment Variables**:

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Client + Server | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Supabase anon key (browser) |
| `SUPABASE_URL` | Server | Same URL, for API functions |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Same anon key, for token verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role — admin DB ops, bypasses RLS |
| `WOMPI_ENV` | Server | `sandbox` or `production` |
| `WOMPI_PRIVATE_KEY` | Server | Wompi private API key |
| `WOMPI_EVENTS_KEY` | Server | Wompi events secret (signature verification) |

Configure the Wompi webhook URL to:

```
https://<your-domain>/api/wompi-webhook
```

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo on Vercel.
3. Set the environment variables above.
4. Deploy. The default settings (Vite framework preset) work out of the box.
