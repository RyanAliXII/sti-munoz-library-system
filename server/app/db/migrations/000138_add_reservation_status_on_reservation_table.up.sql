ALTER TABLE IF EXISTS services.reservation
ADD COLUMN status_id INT  DEFAULT 1,
ADD CONSTRAINT fk_reservation_status FOREIGN KEY (status_id) REFERENCES services.reservation_status (id);
