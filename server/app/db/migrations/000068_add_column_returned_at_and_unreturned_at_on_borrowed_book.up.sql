ALTER TABLE IF EXISTS circulation.borrow_transaction
ADD COLUMN IF NOT EXISTS unreturned_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;