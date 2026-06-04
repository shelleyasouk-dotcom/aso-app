-- Link class_children to children table so award tracker syncs with register children
alter table public.class_children add column if not exists child_id uuid references public.children(id) on delete set null;
create index if not exists class_children_child_id_idx on public.class_children(child_id);
