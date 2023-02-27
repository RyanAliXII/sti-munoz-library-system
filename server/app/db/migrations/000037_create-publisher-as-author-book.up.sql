CREATE TABLE IF NOT EXISTS catalog.publisher_book_author(
    id integer primary key generated always as identity,
    book_id uuid,
    publisher_id int,
    created_at timestamptz DEFAULT NOW(),
    FOREIGN KEY(book_id) REFERENCES catalog.book(id),
    FOREIGN KEY(publisher_id) REFERENCES catalog.publisher(id)
)