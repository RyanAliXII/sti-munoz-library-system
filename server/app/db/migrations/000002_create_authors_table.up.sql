CREATE TABLE IF NOT EXISTS book.authors(
	id integer primary key generated always as identity,
	given_name varchar(100),
	middle_name varchar(100),
	surname varchar(100)
)
