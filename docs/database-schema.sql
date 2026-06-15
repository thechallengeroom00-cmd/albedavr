-- GeeGee AI Workshop Platform V1 database schema draft

create table workshops (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  location text,
  client_name text,
  workshop_date date,
  start_time time,
  end_time time,
  audience_mode text not null check (audience_mode in ('primary', 'secondary')),
  provider text not null default 'mock',
  web_mode text not null default 'off',
  modules jsonb not null,
  topics jsonb not null,
  retention_days integer not null default 30,
  force_end_screen boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  nickname text not null,
  group_name text not null,
  active_topic text,
  is_paused boolean not null default false,
  is_blocked boolean not null default false,
  joined_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  role text not null check (role in ('participant', 'assistant', 'system')),
  content text not null,
  topic text,
  moderation_status text not null check (moderation_status in ('allowed', 'blocked', 'flagged')),
  moderation_reason text,
  created_at timestamptz not null default now()
);

create table results (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  type text not null check (type in ('text', 'image', 'audio', 'certificate')),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table moderation_events (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  severity text not null check (severity in ('low', 'medium', 'high')),
  category text not null,
  original_input text,
  action text not null check (action in ('blocked', 'flagged', 'paused')),
  created_at timestamptz not null default now()
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  badges jsonb not null default '[]'::jsonb,
  pdf_url text,
  generated_at timestamptz not null default now()
);
