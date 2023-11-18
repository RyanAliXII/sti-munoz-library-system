CREATE TABLE borrowing.queue(
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   book_id UUID NOT NULL,
   account_id UUID NOT NULL,
   created_at timestamptz default now(),
   dequeued_at timestamptz,
   position INT NOT NULL,
   FOREIGN KEY (book_id) REFERENCES catalog.book(id),
   FOREIGN KEY (account_id) REFERENCES system.account(id)
)