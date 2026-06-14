-- ApnaPin — Civic issue / complaint tracker  (see docs/complaint-system.md)
-- ─────────────────────────────────────────────────────────────────────────────
-- A JIRA-style civic tracker anchored to a location. Four states only:
--   reported → verified → in_progress → resolved
-- ApnaPin never claims an authority resolved anything — resolution is always
-- attributed to the community. Status transitions/weighted scoring are NOT
-- enforced here yet (v1 UI is file + list + confirm); columns exist so the
-- model is locked. Controlled vocab (categories/statuses) lives in lib/types.ts.

create table issues (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references locations(id) on delete cascade,
  pin_code      char(6) not null,                      -- denormalised for cross-location dashboards
  author_id     uuid references auth.users(id) on delete set null,
  title         text not null check (length(title) between 1 and 160),
  description   text,
  category      text not null check (category in ('road','water','electricity','sanitation','safety','other')),
  status        text not null default 'reported' check (status in ('reported','verified','in_progress','resolved')),
  location_text text,                                  -- "near XYZ School, main road"
  photo_urls    text[] not null default '{}',
  confirmation_score real not null default 0,
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  stale_at      timestamptz                            -- "needs re-confirmation" after 30d inactivity
);

create index issues_location_idx on issues (location_id, created_at desc);
create index issues_pin_idx on issues (pin_code);
create index issues_status_idx on issues (status);

-- Community actions (not likes): confirm / affected / resolved. One per user/type.
create table issue_confirmations (
  id         uuid primary key default gen_random_uuid(),
  issue_id   uuid not null references issues(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('confirm','affected','resolved')),
  note       text,
  photo_url  text,
  created_at timestamptz not null default now(),
  unique (issue_id, user_id, type)
);

create index issue_confirmations_issue_idx on issue_confirmations (issue_id);

-- Evidence attached to a transition (tweet link, complaint no., notice photo…).
create table issue_evidence (
  id         uuid primary key default gen_random_uuid(),
  issue_id   uuid not null references issues(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  type       text not null check (type in ('tweet_link','complaint_number','email_ref','photo','official_notice')),
  value      text,
  note       text,
  created_at timestamptz not null default now()
);

create index issue_evidence_issue_idx on issue_evidence (issue_id);

-- Public aggregate: action counts per issue (drives the "N affected · M confirm" line).
create view issue_action_summary as
  select issue_id, type, count(*) as n
  from issue_confirmations
  group by issue_id, type;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — public read; authenticated file/act; authors edit/withdraw their own.
-- ─────────────────────────────────────────────────────────────────────────────
alter table issues              enable row level security;
alter table issue_confirmations enable row level security;
alter table issue_evidence      enable row level security;

create policy issues_select_public on issues for select using (true);
create policy issues_insert_auth   on issues for insert to authenticated with check (author_id = auth.uid());
create policy issues_update_own    on issues for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy issues_delete_own    on issues for delete to authenticated using (author_id = auth.uid());

create policy confirmations_select_public on issue_confirmations for select using (true);
create policy confirmations_insert_own    on issue_confirmations for insert to authenticated with check (user_id = auth.uid());
create policy confirmations_delete_own    on issue_confirmations for delete to authenticated using (user_id = auth.uid());

create policy evidence_select_public on issue_evidence for select using (true);
create policy evidence_insert_auth   on issue_evidence for insert to authenticated with check (true);

-- Grants (explicit; default privileges from 002 also apply).
grant select, insert, update, delete on issues, issue_confirmations, issue_evidence
  to anon, authenticated, service_role;
grant select on issue_action_summary to anon, authenticated, service_role;
