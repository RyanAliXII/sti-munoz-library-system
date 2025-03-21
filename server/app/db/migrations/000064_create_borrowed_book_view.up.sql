-- DROP VIEW IF EXISTS borrowed_book_view;
-- CREATE OR REPLACE VIEW borrowed_book_view as 
-- SELECT bt.id,
-- 	bt.account_id,
-- 	(case when bt.returned_at is null then false else true end) as is_returned,
-- 	(case when now() > bt.returned_at then true else false end) as is_due,
	
-- 	json_build_object('id',account.id, 'displayName', 
-- 	display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
-- 	COALESCE(
-- 		json_agg(json_build_object('number', 
-- 		bb.accession_number,						   
-- 		'bookId', bb.book_id,
-- 		'copyNumber', accession.copy_number ,
-- 		'returnedAt',bb.returned_at,
-- 		'isReturned', (case when bb.returned_at is null then false else true end),	
-- 		'book', book.json_format		   
-- 	)),'[]') as borrowed_copies,
-- 	bt.created_at, 
-- 	COALESCE(bt.remarks, '') as remarks,
-- 	bt.due_date, bt.returned_at,
-- 	(case when bt.due_date is null then 0 else (
-- 	 case when (now()::date - bt.due_date) < 0 then 0 else (now()::date - bt.due_date) end
-- 	) end) * penalty_on_past_due as penalty
-- 	from circulation.borrow_transaction as bt
-- 	INNER JOIN system.account on bt.account_id = account.id
-- 	INNER JOIN circulation.borrowed_book as bb on bt.id = bb.transaction_id
-- 	INNER JOIN book_view as book on bb.book_id = book.id
-- 	INNER JOIN get_accession_table() as accession on bb.accession_number = accession.number AND bb.book_id = accession.book_id
-- 	GROUP BY bt.id, account.id
-- 	ORDER by bt.created_at DESC