ALTER TABLE IF EXISTS circulation.online_borrowed_book
ADD COLUMN penalty_on_past_due NUMERIC(10,2) DEFAULT 0;