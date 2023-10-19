CREATE TABLE IF NOT EXISTS circulation.borrowed_book(
    transaction_id UUID,
    book_id UUID,
    accession_number INT NOT NULL,
    account_id
    FOREIGN KEY (transaction_id) REFERENCES circulation.borrow_transaction(id),
    FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)