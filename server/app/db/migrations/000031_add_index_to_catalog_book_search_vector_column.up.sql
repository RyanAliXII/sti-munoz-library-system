CREATE INDEX IF NOT EXISTS idx_book_search on catalog.book using GIN(search_vector);