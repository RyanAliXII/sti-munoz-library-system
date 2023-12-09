CREATE TABLE IF NOT EXISTS messaging.notification(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message  TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messaging.client_notification(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID,
    account_id UUID,
    link TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (notification_id) REFERENCES messaging.notification(id),
    FOREIGN KEY (account_id) REFERENCES system.account(id)
);

CREATE TABLE IF NOT EXISTS messaging.admin_notification(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID,
    account_id UUID,
    link TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (notification_id) REFERENCES messaging.notification(id),
    FOREIGN KEY (account_id) REFERENCES system.account(id)
);