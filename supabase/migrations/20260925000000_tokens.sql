-- The Frontier: one row per meme token, each claiming a US state.

create table if not exists public.tokens (
  id          uuid primary key default gen_random_uuid(),
  state_id    text not null check (state_id in (
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY')),
  name        text not null check (char_length(name) between 2 and 32),
  symbol      text not null check (symbol ~ '^[A-Z0-9]{2,8}$'),
  market_cap  numeric not null default 0 check (market_cap >= 0),
  color       text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  creator     text,
  mint        text,
  signature   text,
  is_mock     boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (state_id, symbol)
);

create index if not exists tokens_state_idx on public.tokens (state_id, market_cap desc);

-- Anyone may read the map. Nobody writes from the browser:
-- claims go through the `claim` Edge Function (service role), which verifies
-- the wallet signature; market caps are written by your indexer.
alter table public.tokens enable row level security;

drop policy if exists "tokens are public" on public.tokens;
create policy "tokens are public" on public.tokens for select using (true);

-- Live territory updates.
alter publication supabase_realtime add table public.tokens;
