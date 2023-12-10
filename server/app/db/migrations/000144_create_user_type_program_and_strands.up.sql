CREATE TABLE IF NOT EXISTS system.user_program (
      id SERIAL PRIMARY KEY,
      code varchar (50) NOT NULL UNIQUE,
      name varchar(255) NOT NULL,
      user_type_id INT,
      created_at timestamptz default now(),
      FOREIGN KEY (user_type_id) REFERENCES system.user_type(id)
);


INSERT INTO system.user_program (code, name, user_type_id) 
VALUES
('BSIT', 'Bachelor of Science in Information Technology', 1), 
('BSCS', 'Bachelor of Science in Computer Science', 1),
('ITMAWD', 'IT in Mobile Application and Web Development', 2),
('CCTECH', 'Computer and Communications Technology', 2);