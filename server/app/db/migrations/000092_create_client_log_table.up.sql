CREATE TABLE IF NOT EXISTS system.client_log(
    id uuid primary key DEFAULT uuid_generate_v4(),
    client_id uuid,
    created_at timestamptz default now()
)