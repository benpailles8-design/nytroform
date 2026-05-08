-- PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'client', -- 'coach' ou 'client'
  coach_id uuid,
  created_at timestamp with time zone default now()
);

-- SESSIONS
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_id uuid references profiles(id),
  client_name text,
  coach_id uuid references profiles(id),
  muscles_worked text default '[]',
  total_sets integer default 0,
  exercises text default '[]',
  created_at timestamp with time zone default now()
);

-- POIDS PAR SÉANCE
create table if not exists session_weights (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  client_id uuid references profiles(id),
  weights text default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(session_id, client_id)
);

-- MESURES (poids corporel, taille)
create table if not exists measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  weight numeric,
  height numeric,
  date date default current_date,
  created_at timestamp with time zone default now()
);

-- CONVERSATIONS
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id),
  coach_id uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- MESSAGES
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  sender_name text,
  content text not null,
  is_coach boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table session_weights enable row level security;
alter table measurements enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- POLICIES profiles
create policy "Lecture profil" on profiles for select using (true);
create policy "Modifier son profil" on profiles for update using (auth.uid() = id);
create policy "Insérer profil" on profiles for insert with check (true);

-- POLICIES sessions
create policy "Voir ses séances" on sessions for select using (
  auth.uid() = client_id or auth.uid() = coach_id
);
create policy "Créer séance (coach)" on sessions for insert with check (auth.uid() = coach_id);
create policy "Modifier séance (coach)" on sessions for update using (auth.uid() = coach_id);
create policy "Supprimer séance (coach)" on sessions for delete using (auth.uid() = coach_id);

-- POLICIES session_weights
create policy "Voir ses poids" on session_weights for select using (auth.uid() = client_id);
create policy "Gérer ses poids" on session_weights for insert with check (auth.uid() = client_id);
create policy "Mettre à jour poids" on session_weights for update using (auth.uid() = client_id);

-- POLICIES measurements
create policy "Voir ses mesures" on measurements for select using (auth.uid() = user_id);
create policy "Ajouter mesure" on measurements for insert with check (auth.uid() = user_id);

-- POLICIES conversations
create policy "Voir ses conversations" on conversations for select using (
  auth.uid() = client_id or auth.uid() = coach_id
);
create policy "Créer conversation" on conversations for insert with check (true);
create policy "Modifier conversation" on conversations for update using (
  auth.uid() = client_id or auth.uid() = coach_id
);

-- POLICIES messages
create policy "Voir messages" on messages for select using (
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.client_id = auth.uid() or c.coach_id = auth.uid())
  )
);
create policy "Envoyer message" on messages for insert with check (auth.uid() = sender_id);

-- TRIGGER auto-création profil
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Activer realtime pour messages
alter publication supabase_realtime add table messages;
