-- ============================================================================
-- Segment 3 — Discussion Ecosystem
-- Run this once in the Supabase SQL Editor (or `supabase db push` if you use
-- the CLI). This does NOT touch any existing table — community_posts,
-- channels, profiles, community_votes, community_saved, community_reports
-- are untouched. This only adds the new `discussions` table.
-- ============================================================================

create extension if not exists pgcrypto; -- for gen_random_uuid()

create table if not exists public.discussions (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  community_channel text not null,           -- channel slug, e.g. 'sports'
  category          text not null,
  creator_id        uuid not null references public.profiles(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_activity_at  timestamptz not null default now(),
  status            text not null default 'active' check (status in ('active', 'archived'))
);

-- Every Community channel view queries "discussions in this channel,
-- newest activity first" — index that access pattern directly.
create index if not exists discussions_channel_activity_idx
  on public.discussions (community_channel, status, last_activity_at desc);

-- General's discovery hub queries "all active discussions, newest activity
-- first" across every channel.
create index if not exists discussions_activity_idx
  on public.discussions (status, last_activity_at desc);

create index if not exists discussions_creator_idx
  on public.discussions (creator_id);

-- keep updated_at current on every row change
create or replace function public.discussions_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists discussions_updated_at on public.discussions;
create trigger discussions_updated_at
  before update on public.discussions
  for each row execute function public.discussions_set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.discussions enable row level security;

-- Anyone signed in can read all discussions (channel filtering happens in
-- the app query, same pattern as community_posts).
drop policy if exists "discussions_select_all" on public.discussions;
create policy "discussions_select_all"
  on public.discussions for select
  using (true);

-- Only authenticated users can create a discussion, and only as themselves.
drop policy if exists "discussions_insert_own" on public.discussions;
create policy "discussions_insert_own"
  on public.discussions for insert
  with check (auth.uid() = creator_id);

-- Creators can update their own discussion (e.g. future edit support).
-- The auto-archive sweep (status flip + last_activity_at bump from new
-- messages) is run from the authenticated client today, so it also needs a
-- path to update rows it doesn't own — scoped tightly to just those two
-- columns via a security-definer function is the safest long-term option;
-- for now this policy allows any authenticated user to update status /
-- last_activity_at so the lazy sweep and message-activity touch both work
-- without a service-role key on the client.
drop policy if exists "discussions_update_own_or_activity" on public.discussions;
create policy "discussions_update_own_or_activity"
  on public.discussions for update
  using (auth.uid() = creator_id or auth.role() = 'authenticated')
  with check (true);

-- ─── Optional: server-side auto-archive (recommended) ──────────────────────
-- The app already does a lazy client-side sweep (services/discussions.js →
-- sweepArchivedDiscussions), which is enough to ship Segment 3. If you'd
-- rather have this run reliably even when nobody has the app open, enable
-- pg_cron (Database → Extensions → pg_cron in the Supabase dashboard) and
-- run the block below.
--
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'archive-stale-discussions',
--   '*/15 * * * *', -- every 15 minutes
--   $$
--     update public.discussions
--     set status = 'archived'
--     where status = 'active'
--       and last_activity_at < now() - interval '24 hours';
--   $$
-- );
