CREATE OR REPLACE FUNCTION find_audited_accesion_json (table_name character varying, book_id uuid, audit_id uuid)
returns json
language plpgsql
as $body$
	declare 
		data json;
	begin
		execute format
		('SELECT  json_agg(json_build_object(%L,
		  acc.copy_number, %L, acc.id, %L,
		( SELECT EXISTS(SELECT 1 FROM inventory.audited_accession
		 WHERE book_id = %L AND audit_id = %L AND accession_id = acc.id ))
		)) from accession.%s as acc 
		 where book_id = %L
		','copyNumber','number','isAudited', book_id, audit_id, table_name, book_id) into data ;
		RETURN data;
	end
$body$
