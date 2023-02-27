CREATE TABLE IF NOT EXISTS catalog.org_book_author(
    id integer primary key generated always as identity,
    book_id uuid,
    org_id int,
    created_at timestamptz DEFAULT NOW(),
    FOREIGN KEY(book_id) REFERENCES catalog.book(id),
    FOREIGN KEY(org_id) REFERENCES catalog.organization(id)
)