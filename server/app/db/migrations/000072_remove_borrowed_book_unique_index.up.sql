ALTER TABLE IF EXISTS circulation.borrowed_book
DROP CONSTRAINT IF EXISTS book_accession_returned_at_unique_idx;