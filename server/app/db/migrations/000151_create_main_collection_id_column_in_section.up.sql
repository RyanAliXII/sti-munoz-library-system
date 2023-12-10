ALTER TABLE IF EXISTS catalog.section
ADD COLUMN main_collection_id INTEGER,
ADD CONSTRAINT fk_section_section FOREIGN KEY (main_collection_id) REFERENCES catalog.section(id);