CREATE UNIQUE INDEX IF NOT EXISTS bag_account_accession_unique_idx
    ON circulation.bag(account_id, accession_id)
