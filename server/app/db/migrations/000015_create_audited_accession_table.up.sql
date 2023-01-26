CREATE TABLE IF NOT EXISTS inventory.audited_accession (
    book_id UUID,
    audit_id UUID,
    accession_id int,
    FOREIGN KEY(book_id) REFERENCES catalog.book(id),
    FOREIGN KEY(audit_id) REFERENCES inventory.audit(id)
)