ALTER TABLE IF EXISTS circulation.borrowed_book
ADD COLUMN IF NOT EXISTS returned_at timestamptz,
ADD COLUMN IF NOT EXISTS due_date timestamp,
ADD COLUMN IF NOT EXISTS remarks text