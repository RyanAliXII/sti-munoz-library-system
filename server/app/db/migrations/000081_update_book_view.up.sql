--CREATE BOOK VIEW
    CREATE OR REPLACE VIEW book_view as 
	SELECT book.id,title, isbn, 
	description, 
	copies,
	pages,
	cost_price,
	edition,
	year_published,
	received_at,
	ddc,
	author_number,
	book.created_at,
	jsonb_build_object('id', source_of_fund.id, 'name', source_of_fund.name) as fund_source,
	jsonb_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table, 'prefix', section.prefix) as section,
	jsonb_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	jsonb_build_object(
	'people', COALESCE((SELECT  jsonb_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
			  as authors
			  FROM catalog.book_author
			  INNER JOIN catalog.author on book_author.author_id = catalog.author.id
			  where book_id = book.id
			  group by book_id),'[]'),
		
	'organizations', COALESCE((SELECT jsonb_agg(json_build_object('id', org.id, 'name', org.name)) 
							 FROM catalog.org_book_author as oba 
							 INNER JOIN catalog.organization as org on oba.org_id = org.id 
							  where book_id = book.id group by book_id ),'[]'),
		
	'publishers', COALESCE((SELECT jsonb_agg(json_build_object('id', pub.id, 'name', pub.name)) 
						  FROM catalog.publisher_book_author as pba 
						  INNER JOIN catalog.publisher as pub on pba.publisher_id = pub.id 
						  where book_id = book.id group by book_id
						  ),'[]')
	) as authors,
	COALESCE(json_agg(jsonb_build_object('id', accession.id, 'number', accession.number, 'copyNumber', accession.copy_number, 'isAvailable', (CASE WHEN bb.accession_id is not null then false else true END) )), '[]') as accessions,
	COALESCE((SELECT array_agg(path) FROM catalog.book_cover where book_id = book.id), '{}') as covers,
	jsonb_build_object(
		'id', book.id,
		'title', book.title,
		'description', book.description,
		'ddc', book.ddc,
		'authorNumber', book.author_number,
		'isbn', book.isbn,
		'copies', book.copies,
		'pages', book.pages,
		'costPrice', book.cost_price,
		'edition', book.edition,
		'yearPublished', book.year_published,
		'receivedAt', book.received_at,
		'fundSource', jsonb_build_object('id', source_of_fund.id, 'name', source_of_fund.name),
		'publisher', jsonb_build_object('id', publisher.id, 'name', publisher.name),
		'section', jsonb_build_object('id', section.id, 'name', section.name, 'prefix', section.prefix),
		'createdAt',book.created_at,
		'covers', COALESCE((SELECT array_agg(path) FROM catalog.book_cover where book_id = book.id), '{}'),
		'authors', json_build_object(
			'people', COALESCE((SELECT  jsonb_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
					  as authors
					  FROM catalog.book_author
					  INNER JOIN catalog.author on book_author.author_id = catalog.author.id
					  where book_id = book.id
					  group by book_id),'[]'),
				
			'organizations', COALESCE((SELECT jsonb_agg(json_build_object('id', org.id, 'name', org.name)) 
									 FROM catalog.org_book_author as oba 
									 INNER JOIN catalog.organization as org on oba.org_id = org.id 
									  where book_id = book.id group by book_id ),'[]'),
				
			'publishers', COALESCE((SELECT jsonb_agg(json_build_object('id', pub.id, 'name', pub.name)) 
								  FROM catalog.publisher_book_author as pba 
								  INNER JOIN catalog.publisher as pub on pba.publisher_id = pub.id 
								  where book_id = book.id group by book_id
								  ),'[]')
		) 
	  
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id 
	INNER JOIN get_accession_table() as accession on book.id = accession.book_id
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3 OR status_id = 6) 
	GROUP BY 
	book.id,
	source_of_fund.id,
	section.id,
	publisher.id;
-- END OF BOOK VIEW CREATION;

-- -- CREATE ONLINE BORROWED BOOK VIEW
-- CREATE OR REPLACE VIEW online_borrowed_book_view as 
-- SELECT obb.id, obb.account_id, obb.accession_id, obb.due_date, accession.number, remarks,
-- accession.copy_number,obb.status ,book.json_format as book, json_build_object('id', account.id, 'displayName', 
-- display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
-- 	penalty_on_past_due,
-- 	(case when due_date is null or status != 'checked-out'  then 0 else (
-- 	 case when (now()::date - due_date) < 0 then 0 else (now()::date - due_date) end
-- 	) end) * penalty_on_past_due as penalty,
-- 	obb.created_at
-- 	FROM circulation.online_borrowed_book as obb
-- 	INNER JOIN get_accession_table() as accession on obb.accession_id = accession.id
-- 	INNER JOIN book_view as book on accession.book_id = book.id 
-- 	INNER JOIN system.account on obb.account_id = system.account.id
-- 	ORDER BY obb.created_at desc;
-- -- END OF ONLINE BORROWED BOOK VIEW CREATION


-- -- CREATE BOROWED BOOK VIEW
-- CREATE OR REPLACE VIEW borrowed_book_view as 
-- SELECT bb.transaction_id, bb.accession_number as number,
-- 	bb.book_id,
-- 	bt.account_id,
-- 	json_build_object('id',account.id, 'displayName', 
-- 		display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
-- 	COALESCE(bb.remarks, '') as remarks,
-- 	bb.due_date,
-- 	bv.json_format as book,
-- 	bt.penalty_on_past_due,
--     bb.returned_at,
--     bb.cancelled_at,
--     bb.unreturned_at,
-- 	(case when  bb.due_date is null or bb.returned_at is not null or bb.unreturned_at is not null or bb.cancelled_at is not null then 0 else (
-- 		case when (now()::date - bb.due_date) < 0 then 0 else (now()::date - bb.due_date) end
-- 	   ) end) * penalty_on_past_due as penalty,	
-- 	(case when bb.returned_at is null then false else true end) as is_returned,
-- 	(case when bb.cancelled_at is null then false else true end) as is_cancelled,
-- 	(case when bb.unreturned_at is null then false else true end) as is_unreturned,
-- 	bt.created_at
-- 	FROM circulation.borrowed_book as bb 
-- 	INNER JOIN circulation.borrow_transaction as bt on bb.transaction_id = bt.id
-- 	INNER JOIN system.account   on bt.account_id = account.id
-- 	INNER JOIN book_view as bv on bb.book_id = bv.id
-- 	ORDER by bt.created_at DESC;
-- -- END OF BORROWED BOOK VIEW CREATION


-- CREATE ACCOUNT VIEW
-- CREATE OR REPLACE VIEW account_view as 
-- SELECT account.id, email, display_name, given_name, surname,
-- json_build_object('totalPenalty', COALESCE(SUM(bbv.penalty), 0 ) + COALESCE(SUM(obbv.penalty), 0) + COALESCE(penalty_tbl.total, 0), 
-- 'walkInCheckedOutBooks', COALESCE(walk_in_checked_out.total, 0),
-- 'walkInReturnedBooks', COALESCE(walk_in_returned.total, 0),
-- 'onlinePendingBooks', COALESCE(online_pending.total, 0),
-- 'onlineApprovedBooks', COALESCE(online_approved.total, 0),
-- 'onlineCheckedOutBooks', COALESCE(online_checked_out.total, 0),
-- 'onlineReturnedBooks', COALESCE(online_returned.total, 0),	
-- 'onlineCancelledBooks', COALESCE(online_cancelled.total, 0)
-- )
--  as meta_data, 
--  search_vector 
--  FROM system.account 
-- LEFT JOIN borrowed_book_view as bbv on account.id = bbv.account_id and bbv.returned_at is null 
-- and bbv.unreturned_at is null and bbv.cancelled_at is null
-- LEFT JOIN
-- (SELECT penalty.account_id, 
-- SUM(penalty.amount) as total FROM circulation.penalty WHERE penalty.settled_at is null GROUP BY penalty.account_id) 
-- as penalty_tbl on account.id = penalty_tbl.account_id
-- LEFT JOIN  online_borrowed_book_view as obbv on account.id = obbv.account_id and obbv.status = 'checked-out'
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total FROM circulation.borrowed_book as cbb
-- 	INNER JOIN circulation.borrow_transaction as cbt on transaction_id =  cbt.id
-- 	where cbb.returned_at is null 
-- 	GROUP BY account_id
-- ) as walk_in_checked_out on account.id = walk_in_checked_out.account_id
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total FROM circulation.borrowed_book as cbb
-- 	INNER JOIN circulation.borrow_transaction as cbt on transaction_id =  cbt.id
-- 	where cbb.returned_at is not null
-- 	GROUP BY account_id
-- ) as walk_in_returned on account.id = walk_in_returned.account_id
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
-- 	where status = 'pending'
-- 	GROUP BY account_id
-- ) as online_pending on account.id = online_pending.account_id
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
-- 	where status = 'approved'
-- 	GROUP BY account_id
-- ) as online_approved on account.id = online_approved.account_id
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
-- 	where status = 'checked-out'
-- 	GROUP BY account_id
-- ) as online_checked_out on account.id = online_checked_out.account_id
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
-- 	where status = 'returned'
-- 	GROUP BY account_id
-- ) as online_returned on account.id = online_returned.account_id
-- LEFT JOIN 
-- (
-- 	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
-- 	where status = 'cancelled'
-- 	GROUP BY account_id
-- ) as online_cancelled on account.id = online_cancelled.account_id
-- GROUP BY account.id, 
-- walk_in_checked_out.account_id,
-- walk_in_checked_out.total, 
-- walk_in_returned.total,
-- walk_in_returned.account_id,
-- online_pending.account_id,
-- online_pending.total,
-- online_approved.account_id,
-- online_approved.total,
-- online_checked_out.account_id,
-- online_checked_out.total,
-- online_returned.account_id,
-- online_returned.total,
-- online_cancelled.account_id,
-- online_cancelled.total,
-- penalty_tbl.account_id,
-- penalty_tbl.total;

-- END OF ACCOUNT VIEW CREATION

