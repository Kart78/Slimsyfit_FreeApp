-- Run ONLY in a brand-new Supabase project dedicated to Slimsyfit FreeApp.
-- The original SlimSyFit tables and customers are never accessed.
create table if not exists public.wellness_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.wellness_records enable row level security;
revoke all on public.wellness_records from anon;
grant select, insert, update, delete on public.wellness_records to authenticated;

drop policy if exists "Read own wellness records" on public.wellness_records;
create policy "Read own wellness records" on public.wellness_records
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Insert own wellness records" on public.wellness_records;
create policy "Insert own wellness records" on public.wellness_records
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Update own wellness records" on public.wellness_records;
create policy "Update own wellness records" on public.wellness_records
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own wellness records" on public.wellness_records;
create policy "Delete own wellness records" on public.wellness_records
for delete to authenticated using ((select auth.uid()) = user_id);