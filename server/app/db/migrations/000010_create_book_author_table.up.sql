CREATE TABLE IF NOT EXISTS catalog.book_author(
    id integer primary key generated always as identity,
    book_id uuid,
    author_id int,
    created_at timestamptz DEFAULT NOW(),
    FOREIGN KEY(book_id) REFERENCES catalog.book(id),
    FOREIGN KEY(author_id) REFERENCES catalog.author(id)
)