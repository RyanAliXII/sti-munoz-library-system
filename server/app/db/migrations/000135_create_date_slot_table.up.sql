CREATE TABLE IF NOT EXISTS services.time_slot(
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     "date" date NOT NULL,
     profile_id UUID NOT NULL,
     deleted_at timestamptz,
     created_at timestamptz DEFAULT NOW(),
     FOREIGN KEY (profile_id) REFERENCES services.time_slot_profile(id)
)