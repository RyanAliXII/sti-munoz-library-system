ALTER TABLE catalog.book
DROP CONSTRAINT IF EXISTS book_publisher_id_fkey;

ALTER TABLE catalog.publisher_book_author
DROP CONSTRAINT IF EXISTS  publisher_book_author_publisher_id_fkey;

ALTER TABLE catalog.publisher
ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();

ALTER TABLE catalog.publisher
DROP COLUMN id;

ALTER TABLE catalog.publisher
RENAME COLUMN new_id TO id;

ALTER TABLE catalog.publisher
ADD PRIMARY KEY (id);

ALTER TABLE catalog.book
ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT uuid_generate_v4();

ALTER TABLE catalog.book
DROP COLUMN IF EXISTS publisher_id;

ALTER TABLE catalog.book
RENAME COLUMN new_id TO publisher_id;

ALTER TABLE catalog.book
ADD CONSTRAINT book_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES catalog.publisher(id);