CREATE TABLE accession.accession_main(
			id uuid primary key DEFAULT uuid_generate_v4(),
			number INTEGER UNIQUE,
			book_id uuid,
			copy_number int,
			created_at timestamptz DEFAULT NOW(),
			deleted_at timestamptz,
			FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)