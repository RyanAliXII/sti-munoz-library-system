CREATE TABLE IF NOT EXISTS circulation.borrow_transaction(
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       account_id UUID,
       created_at timestamptz DEFAULT NOW(),
       FOREIGN KEY(account_id) REFERENCES client.account(id)
)