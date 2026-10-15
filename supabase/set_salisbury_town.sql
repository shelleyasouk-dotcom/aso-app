-- Fills in town = 'Salisbury' for existing CRM contacts that don't have a
-- town set yet. Only touches blank/null rows, so it won't overwrite any
-- school already filed under a different town.

UPDATE public.crm_contacts
SET town = 'Salisbury', updated_at = now()
WHERE town IS NULL OR trim(town) = '';

SELECT town, count(*) FROM public.crm_contacts GROUP BY town ORDER BY town;
