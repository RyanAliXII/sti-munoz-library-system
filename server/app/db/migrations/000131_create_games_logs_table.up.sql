CREATE TABLE IF NOT EXISTS services.game_log(
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   account_id UUID,
   game_id UUID,
   deleted_at timestamptz,
   created_at timestamptz DEFAULT NOW(),
   FOREIGN KEY(account_id) REFERENCES system.account(id)
)