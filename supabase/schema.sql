create extension if not exists "pgcrypto";

create table if not exists card_lookups (
  id          uuid primary key default gen_random_uuid(),
  card_type   text not null check (card_type in ('pokemon', 'yugioh')),
  card_name   text not null,
  card_number text,
  urls        jsonb not null,
  my_price    numeric(10, 2),
  currency    text not null default 'EUR',
  vinted_suggestion jsonb,
  notes       text,
  created_at  timestamptz not null default now()
);

create index on card_lookups (created_at desc);
