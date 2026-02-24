-- GROWTH App — Supabase Schema
-- Exécuter ce fichier dans l'éditeur SQL de Supabase

-- Profils utilisateurs
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  vision text,
  projects jsonb default '[]',
  jalon_30 text,
  blocages text,
  onboarding_done boolean default false,
  streak integer default 0,
  last_active timestamptz,
  created_at timestamptz default now()
);

-- Intentions quotidiennes
create table intentions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  tache text not null,
  projet text,
  pourquoi text,
  done boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Blocs de travail (sessions 25 min)
create table blocs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  projet text,
  tache text,
  duration integer default 25,
  created_at timestamptz default now()
);

-- Bilans du soir
create table bilans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  blocs integer default 0,
  answers jsonb,
  mentor_reply text,
  created_at timestamptz default now()
);

-- RLS activé sur toutes les tables
alter table profiles enable row level security;
alter table intentions enable row level security;
alter table blocs enable row level security;
alter table bilans enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own intentions" on intentions for all using (auth.uid() = user_id);
create policy "own blocs" on blocs for all using (auth.uid() = user_id);
create policy "own bilans" on bilans for all using (auth.uid() = user_id);

-- Trigger pour créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
