ALTER TABLE catalog.author
ADD CONSTRAINT author_name_deleted_at_unique_idx UNIQUE NULLS NOT DISTINCT(name, deleted_at);