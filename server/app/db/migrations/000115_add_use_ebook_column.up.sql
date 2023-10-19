ALTER TABLE IF EXISTS borrowing.borrowed_book 
ADD COLUMN IF NOT EXISTS is_ebook boolean default false;