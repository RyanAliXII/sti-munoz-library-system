CREATE TABLE IF NOT EXISTS borrowing.borrowed_ebook(
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   book_id UUID NOT NULL,
   due_date date not null,
   status_id int,
   account_id UUID NOT NULL,
   created_at timestamptz default now(),
   FOREIGN KEY (book_id) REFERENCES catalog.book(id),
   FOREIGN KEY (status_id) REFERENCES borrowing.borrow_status(id),
   FOREIGN KEY (account_id) REFERENCES system.account(id)
)