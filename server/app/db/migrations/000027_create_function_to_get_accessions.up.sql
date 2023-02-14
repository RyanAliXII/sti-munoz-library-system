CREATE OR REPLACE FUNCTION get_accession_table()
RETURNS TABLE (id INTEGER, book_id uuid, copy_number INTEGER, created_at timestamptz, deleted_at timestamptz) AS $$
DECLARE
    query text;
    table_name text;
    Cursor1  cursor  FOR
        SELECT DISTINCT accession_table  FROM catalog.section;
BEGIN
    query := '';
    FOR record IN Cursor1 LOOP
        table_name := COALESCE(record.accession_table, 'default_accession');
        query := query || 'SELECT * FROM accession.' || table_name || ' UNION ';
    END LOOP;

    -- remove the last ' UNION ' from the query
    query := substr(query, 1, length(query) - length(' UNION '));

    -- execute the query and return the result
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;