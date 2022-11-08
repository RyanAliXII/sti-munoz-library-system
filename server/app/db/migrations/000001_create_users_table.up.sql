BEGIN;
CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY, 
    firstname varchar(50) not null,
    lastname varchar(50) not null, 
    email TEXT not null
);
COMMIT;