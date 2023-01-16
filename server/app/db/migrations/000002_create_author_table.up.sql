CREATE TABLE IF NOT EXISTS catalog.author(
	id integer primary key generated always as identity,
	given_name varchar(100),
	middle_name varchar(100),
	surname varchar(100),
	deleted_at timestamptz,
	created_at timestamptz DEFAULT NOW()
)
