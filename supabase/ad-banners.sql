-- Ad banners table
create table if not exists public.ad_banners (
  id uuid default uuid_generate_v4() primary key,
  business_name text not null,
  contact_email text,
  image_path text not null,
  click_url text,
  placement text not null check (placement in ('homepage', 'blog', 'newsletter_archive')),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.ad_banners enable row level security;

-- Anyone can read active banners within date range
create policy "Public can read active banners"
  on public.ad_banners for select
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

-- Directors and area leads can manage all banners
create policy "Admins can manage ad banners"
  on public.ad_banners for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead')
    )
  );

-- Storage bucket: create manually in Supabase dashboard
-- Name: ad-banners
-- Public: true
