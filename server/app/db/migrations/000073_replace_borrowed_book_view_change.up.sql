DROP VIEW IF EXISTS account_view;
DROP VIEW IF EXISTS borrowed_book_view;
CREATE OR REPLACE VIEW borrowed_book_view as 
SELECT bb.transaction_id, bb.accession_number as number,
	bb.book_id,
	bt.account_id,
	json_build_object('id',account.id, 'displayName', 
		display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	COALESCE(bb.remarks, '') as remarks,
	bb.due_date,
	bv.json_format as book,
	bt.penalty_on_past_due,
    bb.returned_at,
    bb.cancelled_at,
    bb.unreturned_at,
	(case when  bb.due_date is null or bb.returned_at is not null or bb.unreturned_at is not null or bb.cancelled_at is not null then 0 else (
		case when (now()::date - bb.due_date) < 0 then 0 else (now()::date - bb.due_date) end
	   ) end) * penalty_on_past_due as penalty,	
	(case when bb.returned_at is null then false else true end) as is_returned,
	(case when bb.cancelled_at is null then false else true end) as is_cancelled,
	(case when bb.unreturned_at is null then false else true end) as is_unreturned,
	bt.created_at
	FROM circulation.borrowed_book as bb 
	INNER JOIN circulation.borrow_transaction as bt on bb.transaction_id = bt.id
	INNER JOIN system.account   on bt.account_id = account.id
	INNER JOIN book_view as bv on bb.book_id = bv.id
	ORDER by bt.created_at DESC