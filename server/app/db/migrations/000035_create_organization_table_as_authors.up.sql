CREATE TABLE IF NOT EXISTS catalog.organization(
	id integer primary key generated always as identity,
	name varchar(250) NOT NULL,
	deleted_at timestamptz,
	created_at timestamptz DEFAULT NOW()
)
