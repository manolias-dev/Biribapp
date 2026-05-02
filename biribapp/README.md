# BiribAPP

Score keeper for the Greek card game Biriba. Cross-device, passcode-protected, built on Next.js + Supabase.

## Environment variables (set in Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `APP_PASSCODE` | 4-digit numeric code shared with everyone who can use the app |

## Supabase schema

Run this in Supabase SQL Editor once:

```sql
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text,
  palette_idx int default 0,
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  member_ids uuid[] default '{}',
  created_at timestamptz default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_score int default 3000,
  teams jsonb not null default '[]',
  created_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  scores jsonb not null default '{}',
  edited_at timestamptz,
  at timestamptz default now()
);
```

RLS is intentionally disabled — auth is handled at the API layer with a single shared passcode.
