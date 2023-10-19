CREATE TABLE IF NOT EXISTS circulation.ebook_bag(
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       book_id UUID NOT NULL,
       account_id UUID NOT NULL,
       is_checked boolean DEFAULT false,
       created_at timestamptz DEFAULT NOW(),
       FOREIGN KEY(account_id) REFERENCES system.account(id),
       FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)