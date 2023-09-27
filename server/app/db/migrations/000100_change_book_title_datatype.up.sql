ALTER TABLE catalog.book 
DROP COLUMN IF EXISTS search_vector,
ALTER COLUMN title TYPE TEXT;

