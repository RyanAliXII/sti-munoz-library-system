DO $$
DECLARE
    insertAccessionQuery text := '';
	sectionQuery text := '';
    table_name text;
    sectionRecord Record;
	query text := '';
    Cursor1 CURSOR FOR SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'accession' AND tablename != 'counter';
BEGIN
    FOR record IN Cursor1 LOOP
        table_name := COALESCE(record.tablename, 'accession_main');
		query := 'SELECT accession.id, accession.number, accession.book_id,  accession.copy_number, book.section_id, accession.created_at FROM accession.'|| table_name || ' as accession INNER JOIN catalog.book on accession.book_id = book.id';
		RAISE NOTICE 'q: %', query;
		FOR record in EXECUTE query LOOP
		 	 insertAccessionQuery := 'INSERT INTO catalog.accession (id, number, book_id, copy_number,section_id, created_at)VALUES($1, $2, $3, $4, $5, $6)';
			 EXECUTE  insertAccessionQuery USING record.id, record.number, record.book_id, record.copy_number, record.section_id, record.created_at;
			 RAISE NOTICE 'Record: %', record;
		END LOOP;
    END LOOP;
END;
$$;