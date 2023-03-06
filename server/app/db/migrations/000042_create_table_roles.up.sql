CREATE TABLE IF NOT EXISTS system.role(
     id integer primary key generated always as identity,
     name text,
     permissions jsonb,
     created_at timestamptz default now()
)