ALTER TABLE IF EXISTS system.account
ADD COLUMN active_until date,
ADD COLUMN student_number varchar(50) DEFAULT '',
ADD COLUMN type_id int,
ADD COLUMN program_id int,
ADD CONSTRAINT fk_account_user_type FOREIGN KEY (type_id) REFERENCES system.user_type(id),
ADD CONSTRAINT fk_account_user_program FOREIGN KEY (program_id) REFERENCES system.user_program(id);
