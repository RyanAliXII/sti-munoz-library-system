CREATE TABLE IF NOT EXISTS book.books(
    id uuid primary key DEFAULT uuid_generate_v4 (),
    name varchar(150) NOT NULL,
    description TEXT,
    edition int DEFAULT 0,
    year date,
    source_of_fund_id int,
    publisher_id int,
    cost_price money,
    remarks varchar(100),
    date_received date,
    deleted_at timestamptz,
    weeded_at timestamptz,
    created_at timestamptz DEFAULT NOW(),
    FOREIGN KEY(source_of_fund_id) REFERENCES book.source_of_funds(id),
    FOREIGN KEY(publisher_id) REFERENCES book.publishers(id)
)