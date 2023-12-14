ALTER TABLE catalog.section 
ADD CONSTRAINT collection_name_deleted_at_unique_idx UNIQUE NULLS NOT DISTINCT(name, deleted_at);