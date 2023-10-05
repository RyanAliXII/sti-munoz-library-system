CREATE TABLE IF NOT EXISTS catalog.search_tag (
    id integer primary key generated always as identity,
    book_id uuid,
    name text default '',
    created_at timestamptz default NOW(),
    FOREIGN KEY (book_id) REFERENCES catalog.book(id)
)