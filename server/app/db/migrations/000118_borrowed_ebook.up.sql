CREATE TABLE IF NOT EXISTS borrowing.borrowed_ebook(
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   book_id UUID NOT NULL,
   due_date date not null,
   is_deleted timestamptz,
   FOREIGN KEY (book_id) REFERENCES catalog.book(id)
)