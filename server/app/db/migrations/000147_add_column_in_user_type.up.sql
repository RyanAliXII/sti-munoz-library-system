ALTER TABLE IF EXISTS system.user_type
ADD COLUMN has_program boolean default false;


UPDATE system.user_type set has_program = true where id = 1 or id = 2;