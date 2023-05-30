DROP VIEW IF EXISTS online_borrowed_book_view;
CREATE OR REPLACE VIEW online_borrowed_book_view as 
SELECT obb.id, obb.account_id, obb.accession_id, obb.due_date, accession.number, remarks,
accession.copy_number,obb.status ,book.json_format as book, json_build_object('id', account.id, 'displayName', 
display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	penalty_on_past_due,
	(case when due_date is null or status != 'checked-out'  then 0 else (
	 case when (now()::date - due_date) < 0 then 0 else (now()::date - due_date) end
	) end) * penalty_on_past_due as penalty,
	obb.created_at
	FROM circulation.online_borrowed_book as obb
	INNER JOIN get_accession_table() as accession on obb.accession_id = accession.id
	INNER JOIN book_view as book on accession.book_id = book.id 
	INNER JOIN system.account on obb.account_id = system.account.id
	ORDER BY obb.created_at desc