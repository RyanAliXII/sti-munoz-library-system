DROP VIEW IF EXISTS account_view;
CREATE OR REPLACE VIEW account_view as 
SELECT account.id, email, display_name, given_name, surname,
json_build_object('totalPenalty', COALESCE(SUM(bbv.penalty), 0 ) + COALESCE(SUM(obbv.penalty), 0) )
 as meta_data, 
 search_vector 
 FROM system.account 
LEFT JOIN borrowed_book_view as bbv on account.id = bbv.account_id and bbv.returned_at is null
LEFT JOIN  online_borrowed_book_view as obbv on account.id = obbv.account_id and obbv.status = 'checked-out'
GROUP BY account.id
