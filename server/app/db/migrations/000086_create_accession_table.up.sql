CREATE TABLE IF NOT EXISTS catalog.accession(
			id uuid primary key DEFAULT uuid_generate_v4(),
			number INTEGER,
			book_id uuid,
			copy_number int,
            section_id INTEGER,
            remarks text DEFAULT '',
			created_at timestamptz DEFAULT NOW(),
			weeded_at timestamptz,
            FOREIGN KEY(section_id) REFERENCES catalog.section(id),
			FOREIGN KEY(book_id) REFERENCES catalog.book(id)
)

