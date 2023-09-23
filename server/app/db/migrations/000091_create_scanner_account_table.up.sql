CREATE TABLE IF NOT EXISTS system.scanner_account(
    	id uuid primary key DEFAULT uuid_generate_v4(),
        username varchar(50) NOT NULL,
        password varchar(50) NOT NULL,
        description text DEFAULT '',
        created_at timestamptz default now()
)