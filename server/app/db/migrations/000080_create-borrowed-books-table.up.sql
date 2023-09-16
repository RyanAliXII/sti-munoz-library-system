CREATE TABLE IF NOT EXISTS borrowing.borrowed_book(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL,
    account_id UUID,
    accession_id UUID,
    status_id INT,
    due_date date,
    remarks text DEFAULT '',
    created_at timestamptz DEFAULT NOW(),
    FOREIGN KEY(account_id) REFERENCES system.account(id),
    FOREIGN KEY(status_id) REFERENCES borrowing.borrow_status(id)
)