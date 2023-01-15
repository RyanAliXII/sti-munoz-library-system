CREATE TABLE IF NOT EXISTS catalog.source_of_fund(
	id integer primary key generated always as identity,
	name varchar(100) NOT NULL,
	deleted_at timestamptz,
	created_at timestamptz DEFAULT NOW()
)
