-- One-time remap of existing crm_contacts.status values (old CRM) to the
-- new Schools Acquisition SOP v2.2 statuses. Safe to re-run — a no-op once done.

UPDATE public.crm_contacts SET status = 'in_contact' WHERE status IN ('initial_sent', 'following_up');
UPDATE public.crm_contacts SET status = 'school_interested' WHERE status = 'interested';
UPDATE public.crm_contacts SET status = 'live' WHERE status = 'onboarded';
UPDATE public.crm_contacts SET status = 'opted_out' WHERE status = 'do_not_contact';

SELECT status, count(*) FROM public.crm_contacts GROUP BY status ORDER BY status;
