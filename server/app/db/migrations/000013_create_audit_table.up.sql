CREATE TABLE IF NOT EXISTS inventory.audit(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(150),
    finished_at timestamptz,
    created_at timestamptz DEFAULT NOW()
)