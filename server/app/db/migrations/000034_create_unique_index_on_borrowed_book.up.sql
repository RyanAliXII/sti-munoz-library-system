ALTER TABLE circulation.borrowed_book DROP CONSTRAINT IF EXISTS book_accession_returned_at_unique_idx;
ALTER TABLE circulation.borrowed_book 
ADD CONSTRAINT book_accession_returned_at_unique_idx UNIQUE NULLS NOT DISTINCT(book_id,accession_number, returned_at);