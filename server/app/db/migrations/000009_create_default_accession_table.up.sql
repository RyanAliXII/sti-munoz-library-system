CREATE TABLE accession.accession_main(
			id integer primary key generated always as identity,
			book_id uuid,
			copy_number int,
			created_at timestamptz DEFAULT NOW(),
			deleted_at timestamptz,
			FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)