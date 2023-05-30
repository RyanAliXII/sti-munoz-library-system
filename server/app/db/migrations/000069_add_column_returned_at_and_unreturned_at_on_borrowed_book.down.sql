ALTER TABLE IF EXISTS circulation.borrowed_book
DROP COLUMN IF EXISTS unreturned_at,
DROP COLUMN IF EXISTS cancelled_at;