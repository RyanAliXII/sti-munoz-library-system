ALTER TABLE IF EXISTS system.user_type
ADD COLUMN max_unique_device_reservation_per_day INTEGER DEFAULT 1;