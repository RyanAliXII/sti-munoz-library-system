CREATE TABLE IF NOT EXISTS system.token(
    id uuid primary key,
    token text default '',
    created_at timestamptz default now()
)