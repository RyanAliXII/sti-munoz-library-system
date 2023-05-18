ALTER TABLE IF EXISTS circulation.bag
ADD COLUMN IF NOT EXISTS is_checked boolean DEFAULT false;