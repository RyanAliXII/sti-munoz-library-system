CREATE TABLE IF NOT EXISTS accession.counter (
    accession TEXT UNIQUE,
    last_value integer NOT NULL DEFAULT 0
)