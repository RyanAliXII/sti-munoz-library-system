ALTER TABLE catalog.publisher
ADD CONSTRAINT publisher_name_deleted_at_unique_idx UNIQUE NULLS NOT DISTINCT(name, deleted_at);