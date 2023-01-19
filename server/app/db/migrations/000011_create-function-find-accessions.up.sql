CREATE OR REPLACE FUNCTION find_accession_json (table_name character varying, book_id uuid)
returns json
language plpgsql
as $body$
	declare 
		data json;
	begin
		execute format
		('SELECT  json_agg(json_build_object(%L,
		  acc.copy_number, %L, acc.id)) from accession.%s as acc 
		 where book_id = %L LIMIT 1
		','copy_number','id', table_name, book_id) into data ;
		RETURN data;
	end
$body$
