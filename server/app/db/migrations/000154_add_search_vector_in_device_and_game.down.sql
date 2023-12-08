DROP INDEX IF EXISTS idx_device_search;
DROP INDEX IF EXISTS idx_game_search;

ALTER TABLE IF EXISTS services.device
DROP COLUMN search_vector;

ALTER TABLE IF EXISTS services.game
DROP COLUMN search_vector;