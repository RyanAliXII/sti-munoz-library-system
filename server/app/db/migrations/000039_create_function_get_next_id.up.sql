CREATE OR REPLACE FUNCTION get_next_id(accession_counter_column text) RETURNS integer AS $$
DECLARE
    next_value integer;
BEGIN
    EXECUTE 'UPDATE accession."counter" 
	SET last_value = last_value + 1 where accession = $1 RETURNING last_value' 
	USING accession_counter_column
	INTO next_value;
    RETURN next_value;
END;
$$ LANGUAGE plpgsql;

