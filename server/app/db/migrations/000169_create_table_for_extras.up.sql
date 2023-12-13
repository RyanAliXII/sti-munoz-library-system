CREATE TABLE IF NOT EXISTS system.extras(
    id INTEGER PRIMARY KEY, 
    value TEXT DEFAULT ''
);
INSERT INTO system.extras (id, value)
VALUES
  (1, ''),
  (2, '');