CREATE TABLE borrowing.queue(
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   book_id UUID NOT NULL,
   account_id UUID NOT NULL,
   queued_at timestamptz UNIQUE default now(),
   dequeued_at timestamptz,
   created_at timestamptz default now(),
   FOREIGN KEY (book_id) REFERENCES catalog.book(id),
   FOREIGN KEY (account_id) REFERENCES system.account(id)
)