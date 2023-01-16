CREATE TABLE IF NOT EXISTS catalog.section(
   id integer primary key generated always as identity,
   name varchar(150),
   own_accession varchar(200) DEFAULT NULL,
   deleted_at timestamptz,
   created_at timestamptz DEFAULT NOW()
)