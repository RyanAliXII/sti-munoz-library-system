DROP VIEW IF EXISTS borrowed_book_view;
DROP VIEW IF EXISTS book_view;
ALTER TABLE IF EXISTS catalog.author
ADD COLUMN name varchar(100) DEFAULT '',
DROP COLUMN given_name,
DROP COLUMN middle_name,
DROP COLUMN surname