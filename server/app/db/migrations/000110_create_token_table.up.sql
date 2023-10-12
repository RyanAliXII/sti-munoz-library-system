CREATE TABLE IF NOT EXISTS system.token(
    id uuid primary key,
    token text default '',
    revoked_at timestamptz,
    created_at timestamptz default now()
)