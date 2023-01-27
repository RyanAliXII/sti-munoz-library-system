CREATE TABLE IF NOT EXISTS inventory.audited_book(
    id integer primary key generated always as identity,
    book_id UUID,
    audit_id  UUID, 
    FOREIGN KEY(book_id) REFERENCES catalog.book(id),
    FOREIGN KEY(audit_id) REFERENCES inventory.audit(id)
)