ALTER TABLE IF EXISTS system.role
DROP COLUMN IF EXISTS permissions;

CREATE TABLE IF NOT EXISTS system.role_permission (
    id SERIAL PRIMARY KEY,
    role_id INT,
    value TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (role_id) REFERENCES system.role(id)
);