-- Add 'retired' to TR sections for soft delete
alter table if exists tr_sections
  add column if not exists retired boolean not null default false;

-- Ensure admin_config row exists
insert into admin_config (id) values (true) on conflict (id) do nothing;

-- Convenience indexes
create index if not exists idx_tr_sections_retired on tr_sections(retired);
create index if not exists idx_roles_user on roles(user_id);
create index if not exists idx_classes_code on classes(code);
