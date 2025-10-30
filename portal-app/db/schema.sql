-- Roles table
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role in ('WESR_ADMIN','PROVIDER','INSTRUCTOR','LEARNER')),
  created_at timestamptz default now()
);

-- Admin config (disciplines, roles, difficulty mix, expiry, passThreshold)
create table if not exists admin_config (
  id boolean primary key default true,
  pass_threshold numeric not null default 0.80,
  expiry_months int not null default 24,
  difficulty_mix jsonb not null default '{"easy":0.60,"medium":0.30,"hard":0.10}',
  disciplines text[] not null default array['HV','LV','Mechanical','Hydraulic','Systems/Comms','Docs/Audit'],
  role_tags text[] not null default array['HV Operator','Switching Assistant','Work Planner','PCEI','PCWA','Delegated PCEI','Installer']
);

-- TR sections
create table if not exists tr_sections (
  id text primary key,
  title text not null,
  version text not null default '1.0.0',
  disciplines text[] not null,
  roles text[] not null,
  question_count int not null
);

-- Questions pool (no answers exposed via client)
create table if not exists questions (
  id text primary key,
  locale text not null default 'en',
  type text not null check (type in ('mcq','multi')),
  prompt text not null,
  choices text[] not null,
  answer_key int[] not null,
  section_tags text[] not null,
  difficulty int not null check (difficulty in (1,2,3)),
  valid_from_version text not null default '1.0.0',
  retired boolean not null default false
);

-- Providers
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  created_at timestamptz default now()
);

-- Classes
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  code text not null unique,
  selected_sections text[] not null,
  version_lock jsonb not null,
  created_at timestamptz default now()
);

-- Attempts
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_identifier text not null,
  class_id uuid not null references classes(id) on delete cascade,
  items jsonb not null, -- [{qId, sectionId, ok}]
  section_scores jsonb not null, -- {sectionId:score}
  endorsements_awarded text[] not null,
  completed_at timestamptz default now()
);

-- Certificates
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_identifier text not null,
  endorsements jsonb not null, -- [{sectionId,version,grantedAt,expiresAt}]
  verify_hash text not null unique,
  created_at timestamptz default now()
);

-- Billing usage (per participant per class at first issuance)
create table if not exists billing_usage (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  user_identifier text not null,
  triggered_at timestamptz default now(),
  unique (provider_id, class_id, user_identifier)
);

-- RLS enable
alter table roles enable row level security;
alter table admin_config enable row level security;
alter table tr_sections enable row level security;
alter table questions enable row level security;
alter table providers enable row level security;
alter table classes enable row level security;
alter table attempts enable row level security;
alter table certificates enable row level security;
alter table billing_usage enable row level security;

-- Simplified policies (tighten further in production)
-- Admin read/write everything
create policy admin_all on admin_config for all using (exists(select 1 from roles r where r.user_id = auth.uid() and r.role='WESR_ADMIN'));
create policy admin_tr_rw on tr_sections for all using (exists(select 1 from roles r where r.user_id = auth.uid() and r.role='WESR_ADMIN'));
create policy admin_questions_rw on questions for all using (exists(select 1 from roles r where r.user_id = auth.uid() and r.role='WESR_ADMIN'));
create policy admin_providers_rw on providers for all using (exists(select 1 from roles r where r.user_id = auth.uid() and r.role='WESR_ADMIN'));

-- Provider read their classes, attempts, billing; write classes
create policy provider_classes_rw on classes for all using (
  exists(select 1 from roles r join providers p on r.user_id=auth.uid() and r.role='PROVIDER'
        where p.id=classes.provider_id)
);
create policy provider_attempts_r on attempts for select using (
  exists(select 1 from classes c join providers p on c.id=attempts.class_id and p.id=c.provider_id
    join roles r on r.user_id=auth.uid() and r.role='PROVIDER')
);
create policy provider_billing_r on billing_usage for select using (
  exists(select 1 from classes c join providers p on p.id=c.provider_id and c.id=billing_usage.class_id
    join roles r on r.user_id=auth.uid() and r.role='PROVIDER')
);

-- Learner: no direct table writes except attempts via RPC (we’ll expose API route)
-- Certificates: public verify by hash via API route (no direct table access)
