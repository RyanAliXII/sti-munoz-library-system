ALTER TABLE IF EXISTS circulation.borrow_transaction
DROP COLUMN IF EXISTS unreturned_at,
DROP COLUMN IF EXISTS cancelled_at;