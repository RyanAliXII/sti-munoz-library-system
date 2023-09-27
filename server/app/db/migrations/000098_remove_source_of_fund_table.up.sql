ALTER TABLE  catalog.book
DROP CONSTRAINT IF EXISTS book_fund_source_id_fkey;


DROP TABLE IF EXISTS catalog.source_of_fund;

ALTER TABLE IF EXISTS catalog.book
DROP COLUMN IF EXISTS fund_source_id,
ADD COLUMN IF NOT EXISTS source_of_fund varchar(100),
ALTER COLUMN source_of_fund SET DEFAULT '';