ALTER TABLE catalog.book_author 
DROP CONSTRAINT IF EXISTS book_author_author_id_fkey;

ALTER TABLE catalog.author 
ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();

ALTER TABLE catalog.author 
DROP COLUMN id;

ALTER TABLE catalog.author 
RENAME COLUMN new_id TO id;

ALTER TABLE catalog.author 
ADD PRIMARY KEY (id);

ALTER TABLE catalog.book_author 
ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT uuid_generate_v4();

ALTER TABLE catalog.book_author 
DROP COLUMN IF EXISTS author_id;

ALTER TABLE catalog.book_author 
RENAME COLUMN new_id TO author_id;

ALTER TABLE catalog.book_author 
ADD CONSTRAINT book_author_author_id_fkey FOREIGN KEY (author_id) REFERENCES catalog.author(id);