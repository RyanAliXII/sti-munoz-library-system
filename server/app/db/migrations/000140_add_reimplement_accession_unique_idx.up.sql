CREATE UNIQUE INDEX IF NOT EXISTS unique_idx_accession_book_id_copy
ON catalog.accession(book_id, copy_number);
CREATE UNIQUE INDEX IF NOT EXISTS unique_idx_accession_number_section
ON catalog.accession(section_id, number);