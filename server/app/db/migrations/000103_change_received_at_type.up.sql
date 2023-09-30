DROP VIEW IF EXISTS borrowed_book_view;
DROP VIEW IF EXISTS book_view;
ALTER TABLE IF EXISTS catalog.book
ALTER COLUMN received_at TYPE date;