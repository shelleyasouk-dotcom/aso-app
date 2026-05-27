-- ─────────────────────────────────────────────────────────────────────────────
-- Recruitment: job adverts + online applications
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Job adverts (created by admin)
create table if not exists job_adverts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  role_type       text not null default 'coach',   -- 'coach' | 'lead_coach' | 'assistant' | 'admin' | 'other'
  location        text not null,                   -- free text: town / area / "Multiple locations"
  area            text,                            -- matches schools.area for filtering
  contract_type   text not null default 'part_time', -- 'part_time' | 'full_time' | 'casual' | 'volunteer'
  hours_desc      text,                            -- e.g. "Mon–Fri, 3:15–4:15pm term time"
  salary_desc     text,                            -- e.g. "£14–16/hr depending on experience"
  description     text not null,
  requirements    text,                            -- bullet points / free text
  is_published    boolean not null default false,
  closes_at       date,                            -- null = open indefinitely
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Job applications (submitted by public / candidates)
create table if not exists job_applications (
  id              uuid primary key default gen_random_uuid(),
  job_advert_id   uuid references job_adverts(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  phone           text,
  address         text,
  cover_letter    text,
  experience      text,
  qualifications  text,
  availability    text,
  dbs_status      text,   -- 'enhanced_dbs' | 'basic_dbs' | 'none' | 'in_progress'
  how_heard       text,
  -- Pool join consent
  join_pool       boolean not null default false,
  preferred_locations text,
  travel_distance_miles int,
  status          text not null default 'new',    -- 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  notes           text,                           -- admin internal notes
  created_at      timestamptz not null default now()
);

-- Coach pool self-registrations track which application created them
alter table coach_pool add column if not exists application_id uuid references job_applications(id);

-- RLS: public can INSERT applications; only staff can read/update
alter table job_adverts enable row level security;
alter table job_applications enable row level security;

-- Job adverts: everyone can read published ones
create policy "Public can read published job adverts"
  on job_adverts for select
  using (is_published = true);

-- Job adverts: staff manage all
create policy "Staff can manage job adverts"
  on job_adverts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Job applications: anyone can insert (public application form)
create policy "Anyone can submit a job application"
  on job_applications for insert
  with check (true);

-- Job applications: only authenticated staff can read/update
create policy "Staff can view and manage applications"
  on job_applications for select
  using (auth.role() = 'authenticated');

create policy "Staff can update applications"
  on job_applications for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Helper: auto-update updated_at on job_adverts
create or replace function set_job_advert_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_job_advert_updated_at
  before update on job_adverts
  for each row execute function set_job_advert_updated_at();
