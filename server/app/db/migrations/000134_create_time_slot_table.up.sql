CREATE TABLE IF NOT EXISTS services.time_slot(
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     start_time time NOT NULL,
     end_time time NOT NULL,
     deleted_at timestamptz,
     created_at timestamptz DEFAULT NOW()
)