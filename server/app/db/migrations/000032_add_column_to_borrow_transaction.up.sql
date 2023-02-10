ALTER TABLE IF EXISTS circulation.borrow_transaction
ADD COLUMN IF NOT EXISTS returned_at timestamptz,
ADD COLUMN IF NOT EXISTS due_date timestamp,
ADD COLUMN IF NOT EXISTS remarks text
