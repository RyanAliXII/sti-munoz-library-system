CREATE TABLE IF NOT EXISTS circulation.borrowed_book(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID,
    book_id UUID,
    accession_number INT NOT NULL,
    FOREIGN KEY(account_id) REFERENCES client.account(id),
    FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)