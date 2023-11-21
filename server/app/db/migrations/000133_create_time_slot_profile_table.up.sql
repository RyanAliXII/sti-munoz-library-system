CREATE TABLE IF NOT EXISTS services.time_slot_profile(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) DEFAULT '',
      deleted_at timestamptz,
      created_at timestamptz DEFAULT NOW()
)   