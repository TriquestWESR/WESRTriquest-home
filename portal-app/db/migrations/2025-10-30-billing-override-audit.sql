-- Override logs (instructor requests; admin decides)
create table if not exists override_logs (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  user_identifier text not null,
  section_id text not null,
  reason_category text not null check (reason_category in ('language','accessibility','technical','other')),
  narrative text,
  evidence_url text,
  instructor_user_id uuid not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by uuid,
  created_at timestamptz default now(),
  decided_at timestamptz
);

-- Audit logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_role text,
  action text not null,
  target_table text,
  target_id text,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_audit_created on audit_logs(created_at desc);

-- Billing convenience view by month/provider
create or replace view v_billing_monthly as
  select date_trunc('month', triggered_at)::date as month_start,
         provider_id,
         count(*)::int as participants_first_issuance
  from billing_usage
  group by 1,2;
