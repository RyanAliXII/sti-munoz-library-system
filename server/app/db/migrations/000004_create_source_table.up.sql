CREATE TABLE IF NOT EXISTS book.source_of_funds(
	id integer primary key generated always as identity,
	name varchar(100) NOT NULL,
	deleted_at timestamptz,
	created_at timestamptz DEFAULT NOW()
)
