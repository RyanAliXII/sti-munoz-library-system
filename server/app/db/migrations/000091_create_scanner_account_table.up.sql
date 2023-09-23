CREATE TABLE IF NOT EXISTS system.scanner_account(
    	id uuid primary key DEFAULT uuid_generate_v4(),
        username varchar(50) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        description text DEFAULT '',
        deleted_at timestamptz,
        created_at timestamptz default now()
)