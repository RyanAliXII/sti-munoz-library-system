CREATE UNIQUE INDEX IF NOT EXISTS unique_idx_accession_book_id_copy
ON catalog.accession(book_id, copy_number)