ALTER TABLE IF EXISTS circulation.borrow_transaction
ADD COLUMN penalty_on_past_due  NUMERIC(10,2) DEFAULT 0;