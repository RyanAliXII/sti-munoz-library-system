CREATE TABLE IF NOT EXISTS services.device_log(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID,
    device_id UUID,
    logged_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES system.account(id),
    FOREIGN KEY (device_id) REFERENCES services.device(id)
)