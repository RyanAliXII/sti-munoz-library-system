CREATE TABLE IF NOT EXISTS catalog.book_cover(
  id integer primary key generated always as identity,
  path text,
  book_id uuid,
  FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)