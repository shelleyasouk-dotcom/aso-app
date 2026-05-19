-- UKAG App — Supabase Schema
-- Run this in the Supabase SQL editor for your UKAG project

-- ─── Clubs ───────────────────────────────────────────────────────────────────
create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  town text,
  county text,
  postcode text,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'lapsed', 'pending')),
  affiliation_date date,
  renewal_date date,
  licence_number text,
  disciplines text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'coach'
    check (role in ('admin', 'coach', 'club_manager')),
  phone text,
  club_id uuid references clubs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Coach Licences ──────────────────────────────────────────────────────────
create table coach_licences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  licence_type text not null,
  licence_number text,
  status text not null default 'active'
    check (status in ('active', 'expired', 'suspended', 'pending')),
  issue_date date,
  expiry_date date,
  cpd_hours_required int not null default 0,
  cpd_hours_completed int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Courses ─────────────────────────────────────────────────────────────────
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  discipline text not null default 'gymnastics'
    check (discipline in ('gymnastics', 'trampolining', 'both')),
  course_type text not null default 'Foundation',
  description text,
  date date,
  end_date date,
  location text,
  capacity int,
  status text not null default 'open'
    check (status in ('open', 'full', 'completed', 'cancelled')),
  tutor text,
  cost numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Course Enrolments ───────────────────────────────────────────────────────
create table course_enrolments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'enrolled'
    check (status in ('enrolled', 'completed', 'cancelled', 'failed')),
  completion_date date,
  certificate_issued boolean not null default false,
  certificate_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, profile_id)
);

-- ─── Awards ──────────────────────────────────────────────────────────────────
create table awards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discipline text not null default 'gymnastics'
    check (discipline in ('gymnastics', 'trampolining', 'both')),
  level int not null default 1,
  description text,
  requirements text,
  created_at timestamptz not null default now()
);

-- ─── Coach Awards ────────────────────────────────────────────────────────────
create table coach_awards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  award_id uuid not null references awards(id) on delete cascade,
  date_achieved date,
  awarded_by text,
  notes text,
  created_at timestamptz not null default now(),
  unique (profile_id, award_id)
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table clubs enable row level security;
alter table profiles enable row level security;
alter table coach_licences enable row level security;
alter table courses enable row level security;
alter table course_enrolments enable row level security;
alter table awards enable row level security;
alter table coach_awards enable row level security;

-- Helper: get current user role
create or replace function current_user_role()
returns text language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- Clubs: all authenticated users can read; only admins can write
create policy "clubs_read" on clubs for select using (auth.uid() is not null);
create policy "clubs_insert" on clubs for insert with check (current_user_role() = 'admin');
create policy "clubs_update" on clubs for update using (current_user_role() = 'admin');
create policy "clubs_delete" on clubs for delete using (current_user_role() = 'admin');

-- Profiles: users can read all (needed for coach lists); can only update own
create policy "profiles_read" on profiles for select using (auth.uid() is not null);
create policy "profiles_update" on profiles for update using (auth.uid() = id or current_user_role() = 'admin');

-- Coach licences: own + admin
create policy "licences_read" on coach_licences for select using (profile_id = auth.uid() or current_user_role() = 'admin');
create policy "licences_insert" on coach_licences for insert with check (current_user_role() = 'admin');
create policy "licences_update" on coach_licences for update using (current_user_role() = 'admin');

-- Courses: all read; admin write
create policy "courses_read" on courses for select using (auth.uid() is not null);
create policy "courses_insert" on courses for insert with check (current_user_role() = 'admin');
create policy "courses_update" on courses for update using (current_user_role() = 'admin');

-- Enrolments: own + admin
create policy "enrolments_read" on course_enrolments for select using (profile_id = auth.uid() or current_user_role() = 'admin');
create policy "enrolments_insert" on course_enrolments for insert with check (profile_id = auth.uid() or current_user_role() = 'admin');
create policy "enrolments_update" on course_enrolments for update using (current_user_role() = 'admin');

-- Awards: all read; admin write
create policy "awards_read" on awards for select using (auth.uid() is not null);
create policy "awards_insert" on awards for insert with check (current_user_role() = 'admin');

-- Coach awards: own + admin
create policy "coach_awards_read" on coach_awards for select using (profile_id = auth.uid() or current_user_role() = 'admin');
create policy "coach_awards_insert" on coach_awards for insert with check (current_user_role() = 'admin');
