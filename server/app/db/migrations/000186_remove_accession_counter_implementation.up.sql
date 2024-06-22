DROP INDEX IF EXISTS catalog.unique_idx_accession_number_section;
DROP FUNCTION IF EXISTS get_next_id(accession_counter_column text);
DROP TABLE IF EXISTS accession.counter;


ALTER TABLE catalog.section
DROP COLUMN IF EXISTS accession_table;