CREATE TABLE IF NOT EXISTS services.game (
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   name VARCHAR(150) DEFAULT '',
   description TEXT DEFAULT ''
)