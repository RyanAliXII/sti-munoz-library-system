ALTER TABLE IF EXISTS catalog.ddc
add COLUMN IF NOT EXISTS search_vector tsvector
generated always as ( 
    setweight(to_tsvector('english', name), 'A')   
) stored;