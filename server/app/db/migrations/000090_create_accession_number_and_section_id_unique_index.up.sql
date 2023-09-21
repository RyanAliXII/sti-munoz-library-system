CREATE UNIQUE INDEX IF NOT EXISTS unique_idx_accession_number_section
ON catalog.accession(section_id, number)