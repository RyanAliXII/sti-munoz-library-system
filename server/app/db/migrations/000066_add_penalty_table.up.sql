CREATE TABLE IF NOT EXISTS circulation.penalty(
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     description TEXT DEFAULT '',
     account_id UUID,
     amount NUMERIC(10, 2),
     settled_at timestamptz,
     created_at timestamptz DEFAULT NOW(),
     FOREIGN KEY(account_id) REFERENCES system.account(id)
)