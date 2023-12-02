CREATE TABLE IF NOT EXISTS system.user_type(
    id SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE,
    created_at timestamptz default now()
);

INSERT INTO system.user_type(name)
VALUES('Tertiary'), ('Senior High School'), ('Faculty');