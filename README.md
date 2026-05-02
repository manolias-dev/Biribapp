# BiribAPP

Score keeper for the Greek card game Biriba. Cross-device, passcode-protected, built on Next.js + Supabase.

## Environment variables (set in Vercel)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://abcdefgh.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key (long JWT) |
| `APP_PASSCODE` | 4-digit numeric passcode (e.g. `1234`) |

## Local development

1. Copy `.env.example` to `.env.local` and fill in values.
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

## Deploy

Push to GitHub, import into Vercel, set the three env vars above, deploy.
