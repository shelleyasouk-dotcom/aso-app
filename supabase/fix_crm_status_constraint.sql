-- Older migration added a CHECK constraint locking crm_contacts.status to the
-- original 6 values. That blocks the new SOP statuses. Drop it — the app's
-- TypeScript types are the source of truth for valid statuses now.
-- Run this BEFORE migrate_crm_statuses_to_sop.sql.

ALTER TABLE public.crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_status_check;
