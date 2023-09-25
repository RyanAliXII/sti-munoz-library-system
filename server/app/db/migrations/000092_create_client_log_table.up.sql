CREATE TABLE IF NOT EXISTS system.client_log(
    id uuid primary key DEFAULT uuid_generate_v4(),
    client_id uuid,
    scanner_id uuid,
    created_at timestamptz default now(),
    FOREIGN KEY(client_id) REFERENCES system.account(id),
    FOREIGN KEY(scanner_id) REFERENCES system.scanner_account(id)
)