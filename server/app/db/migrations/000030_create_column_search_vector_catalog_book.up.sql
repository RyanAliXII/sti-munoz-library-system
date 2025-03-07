ALTER TABLE IF EXISTS catalog.book
add IF NOT EXISTS search_vector tsvector
generated always as ( 
    setweight(to_tsvector('english', title), 'A')   
    || ' ' ||
    setweight(to_tsvector('english', description), 'B') ::tsvector

) stored;