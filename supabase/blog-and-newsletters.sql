-- Blog posts
create table if not exists public.blog_posts (
  id          uuid        default uuid_generate_v4() primary key,
  title       text        not null,
  slug        text        not null unique,
  excerpt     text,
  content     jsonb       not null default '[]',
  cover_image_path text,
  author_id   uuid        references public.profiles(id) on delete set null,
  category    text        not null default 'news',
  tags        text[]      not null default '{}',
  is_published boolean    not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- Anyone can read published posts
create policy "Public can read published blog posts"
  on public.blog_posts for select
  using (is_published = true);

-- Directors and area leads can manage all posts
create policy "Admins can manage blog posts"
  on public.blog_posts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead')
    )
  );

-- Newsletters (synced from Brevo or added manually)
create table if not exists public.newsletters (
  id                 uuid        default uuid_generate_v4() primary key,
  title              text        not null,
  brevo_campaign_id  text        unique,
  preview_url        text,
  sent_at            timestamptz,
  created_at         timestamptz not null default now()
);

alter table public.newsletters enable row level security;

create policy "Public can read newsletters"
  on public.newsletters for select
  using (true);

create policy "Admins can manage newsletters"
  on public.newsletters for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead')
    )
  );

-- Storage bucket for blog images (create manually in Supabase dashboard > Storage)
-- Bucket name: blog-images  (public: true)

-- Storage RLS policies for blog-images bucket
create policy "Public can read blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "Admins can upload blog images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead', 'media_tech')
    )
  );

create policy "Admins can update blog images"
  on storage.objects for update
  using (
    bucket_id = 'blog-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead', 'media_tech')
    )
  );

create policy "Admins can delete blog images"
  on storage.objects for delete
  using (
    bucket_id = 'blog-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead', 'media_tech')
    )
  );
