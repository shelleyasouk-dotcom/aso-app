-- Extend children table with fields from Wix registration export
alter table children add column if not exists year_group     text;
alter table children add column if not exists additional_needs text;
alter table children add column if not exists contact_phone  text;
alter table children add column if not exists parent_name    text;
