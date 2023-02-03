CREATE OR REPLACE FUNCTION find_accession_json (table_name character varying, book_id uuid)
returns json
language plpgsql
as $body$
	declare 
		data json;
	begin
		execute format
		('SELECT  json_agg(json_build_object(%L,
		  acc.copy_number, %L, acc.id, %L, book.title, %L, book.id)) from accession.%s as acc 
		 INNER JOIN catalog.book on acc.book_id = book.id
		 where book_id = %L LIMIT 1
		','copyNumber','number','bookTitle','bookId',table_name, book_id) into data ;
		RETURN data;
	end
$body$