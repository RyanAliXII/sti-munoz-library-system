CREATE OR REPLACE FUNCTION get_accession_table()
RETURNS TABLE (id uuid, number integer, book_id uuid, copy_number integer, created_at timestamptz, deleted_at timestamptz) AS $$
DECLARE
    query text;
    table_name text;
    Cursor1 CURSOR FOR SELECT * FROM pg_catalog.pg_tables where schemaname= 'accession' and pg_tables.tablename != 'counter';
BEGIN
    query := '';
    FOR record IN Cursor1 LOOP
        table_name := COALESCE(record.tablename, 'accession_main');
        query := query || 'SELECT * FROM accession.' || table_name || ' UNION ';
    END LOOP;

    -- check if query is not empty before removing ' UNION '
    IF query <> '' THEN
        -- remove the last ' UNION ' from the query
        query := substr(query, 1, length(query) - length(' UNION '));
    END IF;
	
    -- execute the query and return the result
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;