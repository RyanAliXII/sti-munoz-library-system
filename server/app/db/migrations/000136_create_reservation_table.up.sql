CREATE TABLE IF NOT EXISTS services.reservation(
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     date_slot_id UUID NOT NULL,
     time_slot_id UUID NOT NULL,
     device_id UUID NOT NULL,
     account_id UUID NOT NULL,
     remarks TEXT DEFAULT '',
     created_at timestamptz DEFAULT NOW(),
     FOREIGN KEY (date_slot_id) REFERENCES services.date_slot(id),
     FOREIGN KEY (time_slot_id) REFERENCES services.time_slot(id),
     FOREIGN KEY (account_id) REFERENCES system.account(id)
)