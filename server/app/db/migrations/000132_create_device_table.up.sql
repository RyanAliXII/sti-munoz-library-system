CREATE TABLE IF NOT EXISTS services.device(
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   name VARCHAR(100) DEFAULT '',
   description TEXT DEFAULT '',
   available INT DEFAULT 0,
   deleted_at timestamptz,
   created_at timestamptz DEFAULT NOW()
)