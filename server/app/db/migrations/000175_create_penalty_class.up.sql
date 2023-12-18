CREATE TABLE IF NOT EXISTS fee.penalty_classification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    description VARCHAR(255) DEFAULT '' NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ default now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT name_deleted_at_unique_idx UNIQUE NULLS NOT DISTINCT (name, deleted_at)
)