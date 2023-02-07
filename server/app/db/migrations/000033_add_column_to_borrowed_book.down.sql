ALTER TABLE IF EXISTS circulation.borrowed_book
DROP COLUMN IF EXISTS returned_at,
DROP COLUMN IF EXISTS due_date,
DROP COLUMN IF EXISTS remarks 