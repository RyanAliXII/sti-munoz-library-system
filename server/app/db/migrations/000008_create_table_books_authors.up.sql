CREATE TABLE IF NOT EXISTS book.books_authors (
    id integer primary key generated always as identity,
    book_id uuid,
    author_id integer,
    FOREIGN KEY(book_id) REFERENCES book.books(id),
    FOREIGN KEY(author_id) REFERENCES book.authors(id)
)