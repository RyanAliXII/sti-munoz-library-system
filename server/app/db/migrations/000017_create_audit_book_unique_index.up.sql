ALTER TABLE inventory.audited_book DROP CONSTRAINT IF EXISTS book_audit_idx;
ALTER TABLE  inventory.audited_book ADD CONSTRAINT book_audit_idx UNIQUE (book_id, audit_id);