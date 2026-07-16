-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Creates the two tables backing the admin panel:
--   1. store_settings     — menu/config data, public read-only, written only by the server (service role).
--   2. admin_credentials  — the admin password, never exposed to the browser at all.

create table if not exists public.store_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id = 1)
);

insert into public.store_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

-- Anyone (the public site) can read the current settings.
create policy "public can read store settings"
  on public.store_settings for select
  using (true);

-- Deliberately no insert/update/delete policy: the anon/authenticated roles
-- cannot write at all. Only the service_role key (used server-side only,
-- never shipped to the browser) can update this table.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

create table if not exists public.admin_credentials (
  id int primary key default 1,
  password text not null,
  constraint admin_credentials_singleton check (id = 1)
);

insert into public.admin_credentials (id, password)
values (1, 'simao123')
on conflict (id) do nothing;

alter table public.admin_credentials enable row level security;
-- No policies at all here: not even public SELECT. Only service_role
-- (server-side) can ever read or write this table.
