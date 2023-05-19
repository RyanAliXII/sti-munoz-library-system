CREATE TABLE IF NOT EXISTS circulation.online_borrowed_book(
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       account_id UUID,
       accession_id UUID,
       status varchar(50),
       created_at timestamptz DEFAULT NOW(),
       FOREIGN KEY(account_id) REFERENCES system.account(id)
)