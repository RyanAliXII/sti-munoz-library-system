ALTER TABLE IF EXISTS borrowing.penalty
ADD COLUMN class_id UUID,
ADD FOREIGN KEY (class_id) REFERENCES fee.penalty_classification;