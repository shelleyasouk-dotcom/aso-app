create table incident_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  reported_by uuid references profiles(id) not null,
  school_id uuid references schools(id),

  incident_type text not null check (incident_type in ('accident', 'incident', 'near_miss')),
  incident_date date not null,
  incident_time text,
  incident_location text,

  persons_involved text not null,
  description text not null,
  injuries text,

  first_aid_given boolean not null default false,
  first_aid_details text,
  first_aid_given_by text,

  parent_notified boolean not null default false,
  parent_notified_details text,

  witnesses text,
  immediate_action text,

  status text not null default 'submitted' check (status in ('draft', 'submitted', 'reviewed', 'closed')),

  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  further_action_required boolean not null default false,
  further_action_notes text
);

alter table incident_reports enable row level security;

-- Coaches: view, create, and update their own reports (while in draft/submitted)
create policy "coaches view own incident reports"
  on incident_reports for select
  using (reported_by = auth.uid());

create policy "coaches create incident reports"
  on incident_reports for insert
  with check (reported_by = auth.uid());

create policy "coaches update own draft or submitted reports"
  on incident_reports for update
  using (reported_by = auth.uid() and status in ('draft', 'submitted'))
  with check (reported_by = auth.uid());

-- Area leads and directors: full read + update access
create policy "admins view all incident reports"
  on incident_reports for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('area_lead', 'director'))
  );

create policy "admins update incident reports"
  on incident_reports for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('area_lead', 'director'))
  );

-- Keep updated_at current
create or replace function update_incident_reports_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger incident_reports_updated_at
  before update on incident_reports
  for each row execute function update_incident_reports_updated_at();
