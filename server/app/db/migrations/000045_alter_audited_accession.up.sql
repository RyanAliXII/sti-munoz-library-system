ALTER TABLE IF EXISTS inventory.audited_accession
DROP COLUMN IF EXISTS accession_id,
DROP COLUMN IF EXISTS book_id,
ADD COLUMN accession_id uuid;