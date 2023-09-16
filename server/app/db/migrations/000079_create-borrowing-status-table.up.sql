CREATE TABLE IF NOT EXISTS borrowing.borrow_status (
       id integer primary key,
       description text,
       created_at timestamptz DEFAULT NOW()
);

INSERT INTO borrowing.borrow_status (id, description) VALUES 
(1, 'Pending'), 
(2, 'Approved'), 
(3, 'Checked-Out'), 
(4, 'Returned'), 
(5, 'Cancelled'), 
(6, 'Unreturned') ;