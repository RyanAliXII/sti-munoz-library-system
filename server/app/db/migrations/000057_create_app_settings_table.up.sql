CREATE TABLE IF NOT EXISTS system.settings (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     value jsonb default '{}'
)