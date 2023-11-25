CREATE TABLE IF NOT EXISTS services.reservation_status (
   id integer primary key,
   description text,
   created_at timestamptz DEFAULT NOW()
);

INSERT INTO services.reservation_status
(id, description) VALUES 
(1, 'Pending'), 
(2, 'Fulfilled'), 
(3, 'Unfulfilled'),
(4, 'Cancelled');
