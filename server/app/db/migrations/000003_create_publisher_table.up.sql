CREATE TABLE IF NOT EXISTS catalog.publisher(
	id integer primary key generated always as identity,
	name varchar(150) NOT NULL,
	deleted_at timestamptz,
	created_at timestamptz DEFAULT NOW()
)
