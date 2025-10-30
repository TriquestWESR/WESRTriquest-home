create table if not exists provider_users (
  provider_id uuid not null references providers(id) on delete cascade,
  user_id uuid not null,
  provider_role text not null default 'PROVIDER' check (provider_role in ('PROVIDER','INSTRUCTOR')),
  created_at timestamptz default now(),
  primary key (provider_id, user_id)
);
create index if not exists idx_provider_users_user on provider_users(user_id);
