ALTER TABLE IF EXISTS circulation.borrowed_book
ADD COLUMN IF NOT EXISTS unreturned_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;