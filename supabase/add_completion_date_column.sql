-- =============================================================================
-- Add completion_date to staff_documents
--
-- The UploadTask component collects a "completion date" field (e.g. the date
-- a First Aid certificate was earned), but there was no column to store it.
-- After running this migration, the value is persisted correctly.
-- =============================================================================

ALTER TABLE staff_documents
  ADD COLUMN IF NOT EXISTS completion_date date;
