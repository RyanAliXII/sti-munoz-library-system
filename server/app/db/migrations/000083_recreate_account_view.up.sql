-- CREATE ACCOUNT VIEW
CREATE OR REPLACE VIEW account_view as 
SELECT account.id, email, display_name, given_name, surname,
json_build_object('totalPenalty', COALESCE(penalty_tbl.total, 0))
 as meta_data, 
 search_vector 
 FROM system.account 
LEFT JOIN
(SELECT penalty.account_id, 
SUM(penalty.amount) as total FROM circulation.penalty WHERE penalty.settled_at is null GROUP BY penalty.account_id) 
as penalty_tbl on account.id = penalty_tbl.account_id
GROUP BY account.id, 
penalty_tbl.account_id,
penalty_tbl.total;

-- END OF ACCOUNT VIEW CREATION

