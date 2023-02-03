CREATE OR REPLACE FUNCTION find_borrowed_accession_json(transaction_id uuid)
returns json
language plpgsql
as $body$
	declare 
		data json;
	begin
		execute format
		('SELECT  json_agg(json_build_object(%L,
		  acc.copy_number, %L, acc.id, %L, book.title, %L, book.id)) from circulation.borrowed_book as bb
		 INNER JOIN circulation.borrow_transaction as bt on bb.transaction_id = bt.id
		 INNER JOIN client.account on bt.account_id = account.id
		 INNER JOIN catalog.book on bb.book_id = book.id
		 INNER JOIN catalog.section on book.section_id = section.id
		 INNER JOIN find_accession_table(section.accession_table) as acc on bb.accession_number = acc.id
		 WHERE bt.id =%L
		','copyNumber','number','title','bookId', transaction_id) into data ;
		RETURN data;
	end
$body$

