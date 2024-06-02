ALTER TABLE IF EXISTS inventory.audited_accession
ADD FOREIGN KEY(accession_id) REFERENCES catalog.accession(id)