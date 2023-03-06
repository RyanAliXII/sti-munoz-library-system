CREATE TABLE IF NOT EXISTS system.account_role (
    id integer primary key generated always as identity,
    account_id uuid UNIQUE,
    role_id int, 
    FOREIGN KEY (account_id) REFERENCES client.account(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES system.role(id) ON DELETE CASCADE
)