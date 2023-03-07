CREATE TABLE IF NOT EXISTS system.account(
     id UUID PRIMARY KEY,
     email Text NOT NULL,
     display_name Text NOT NULL,
     given_name Text NOT NULL,
     surname Text NOT NULL,
    CONSTRAINT account_email_unique UNIQUE (email)
     
)