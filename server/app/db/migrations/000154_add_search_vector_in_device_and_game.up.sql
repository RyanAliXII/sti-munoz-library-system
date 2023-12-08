ALTER TABLE IF EXISTS services.device
ADD COLUMN IF NOT EXISTS search_vector tsvector
generated always as (
    setweight(to_tsvector('english', name), 'A')
    || ' ' ||
    setweight(to_tsvector('english', description), 'B')::tsvector
) stored;


ALTER TABLE IF EXISTS services.game
ADD COLUMN IF NOT EXISTS search_vector tsvector
generated always as (
    setweight(to_tsvector('english', name), 'A')
    || ' ' ||
    setweight(to_tsvector('english', description), 'B')::tsvector
) stored;


CREATE INDEX IF NOT EXISTS idx_device_search on services.device using GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_game_search on services.game using GIN(search_vector);