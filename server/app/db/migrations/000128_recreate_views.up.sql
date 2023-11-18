DROP VIEW IF EXISTS account_view;
DROP VIEW IF EXISTS borrowed_book_all_view;
DROP VIEW IF EXISTS borrowed_book_view;
DROP VIEW IF EXISTS bag_view;
DROP VIEW IF EXISTS borrowed_ebook_view;
DROP VIEW IF EXISTS book_view;
DROP VIEW IF EXISTS client_book_view;
CREATE OR REPLACE VIEW book_view as 
SELECT book.id,title, isbn, 
	description, 
	pages,
	cost_price,
	edition,
	count((accession)) as copies,
	year_published,
	received_at,
	ddc,
    book.ebook,
    book.subject,
	author_number,
	book.created_at,
	authors.list as authors,
	COALESCE(covers.list,'{}') as covers,
	setweight(to_tsvector('english', search_tag.concatenated), 'A') :: tsvector search_tag_vector,  
	COALESCE(search_tag.list, '{}' ) as search_tags,
	jsonb_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table, 'prefix', section.prefix) as section,
	jsonb_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	COALESCE(jsonb_agg(jsonb_build_object('id', accession.id, 'number', accession.number, 'copyNumber', accession.copy_number, 'isAvailable', (CASE WHEN bb.accession_id is not null then false else true END) )), '[]') as accessions,
	jsonb_build_object(
		'id', book.id,
		'title', book.title,
		'description', book.description,
		'ddc', book.ddc,
        'subject', book.subject,
		'authorNumber', book.author_number,
		'isbn', book.isbn,
		'pages', book.pages,
        'ebook', book.ebook,
		'costPrice', book.cost_price,
		'edition', book.edition,
		'yearPublished', book.year_published,
		'receivedAt', book.received_at,
		'publisher', jsonb_build_object('id', publisher.id, 'name', publisher.name),
		'section', jsonb_build_object('id', section.id, 'name', section.name, 'prefix', section.prefix),
		'createdAt',book.created_at,
		'covers', COALESCE(covers.list,'{}')
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.accession as accession on book.id = accession.book_id
    LEFT JOIN (SELECT book_author.book_id, COALESCE(jsonb_agg(jsonb_build_object('id', author.id, 'name', author.name)), '[]') as list
			   FROM catalog.book_author INNER JOIN catalog.author on book_author.author_id = author.id GROUP BY book_author.book_id) 
	as authors on book.id = authors.book_id
	LEFT JOIN (
		SELECT book_id, array_agg(path) as list FROM catalog.book_cover GROUP BY book_id
	) as covers on book.id = covers.book_id
	LEFT JOIN (
		SELECT book_id, string_agg(name, ', ') as concatenated, array_agg(name) as list   from catalog.search_tag GROUP BY book_id
	) as search_tag on book.id = search_tag.book_id
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3)	--  1 means Pending, 2 means Approved, 3 means checked-out 
	GROUP BY 
	book.id,
	section.id,
	publisher.id,
	authors.list,
	section.id,
	covers.list,
	publisher.id,
	search_tag.concatenated,
	search_tag.list;
	

CREATE OR REPLACE VIEW borrowed_book_view as 
SELECT bb.id, bb.group_id, bb.account_id, bb.accession_id, bb.due_date, accession.number, accession.book_id, bb.remarks,
accession.copy_number,bb.status_id, bs.description as status ,book.json_format as book, 
jsonb_build_object('id', account.id, 'displayName', 
display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	(case when due_date is null or status_id != 3  then 0 else (
	 case when (now()::date - due_date) < 0 then 0 else (now()::date - due_date) end
	) end) * penalty_on_past_due as penalty,
	bb.created_at
	FROM borrowing.borrowed_book as bb
	INNER JOIN catalog.accession as accession on bb.accession_id = accession.id
	INNER JOIN book_view as book on accession.book_id = book.id 
	INNER JOIN system.account on bb.account_id = system.account.id
    INNER JOIN borrowing.borrow_status as bs on bb.status_id = bs.id
	ORDER BY bb.created_at desc;




CREATE OR REPLACE VIEW borrowed_ebook_view as 
SELECT  be.id, be.book_id, be.due_date, be.status_id, bs.description as status,
be.account_id, be.group_id, be.created_at , jsonb_build_object('id', account.id, 'displayName', 
display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
book.json_format as book
FROM borrowing.borrowed_ebook as be
INNER JOIN system.account on be.account_id = system.account.id
INNER JOIN book_view as book on be.book_id = book.id 
INNER JOIN borrowing.borrow_status as bs on be.status_id = bs.id;


CREATE OR REPLACE VIEW borrowed_book_all_view as 
((SELECT id, group_id,client,account_id,book, status, status_id, accession_id, number,copy_number,  penalty, due_date, remarks, false as is_ebook,created_at  from borrowed_book_view ) 
	UNION ALL 
(SELECT id, group_id,client,account_id, book, status, status_id, '00000000-0000-0000-0000-000000000000', 0,0,0.00, due_date, '', true as is_ebook, created_at
FROM borrowed_ebook_view));


CREATE OR REPLACE VIEW client_book_view as 
SELECT book.id,title, isbn, 
	description, 
	pages,
	cost_price,
	edition,
	(count(accession) FILTER(where accession.weeded_at is null)) as copies,
	year_published,
	received_at,
	ddc,
    book.subject,
	author_number,
	book.created_at,
    book.ebook,
	authors.list as authors,
	setweight(to_tsvector('english', search_tag.concatenated), 'A') :: tsvector search_tag_vector,  
	COALESCE(search_tag.list, '{}' ) as search_tags,
	jsonb_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table, 'prefix', section.prefix) as section,
	jsonb_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	COALESCE(jsonb_agg(jsonb_build_object('id', accession.id, 'number', accession.number, 'copyNumber', accession.copy_number, 'isAvailable', (CASE WHEN bb.accession_id is not null then false else true END) )), '[]') as accessions,
	COALESCE(covers.list, '{}') as covers,
	jsonb_build_object(
		'id', book.id,
		'title', book.title,
		'description', book.description,
		'ddc', book.ddc,
        'ebook', book.ebook,
        'subject', book.subject,
		'authorNumber', book.author_number,
		'isbn', book.isbn,
		'pages', book.pages,
		'costPrice', book.cost_price,
		'edition', book.edition,
		'yearPublished', book.year_published,
        'authors', authors.list,
		'receivedAt', book.received_at,
		'publisher', jsonb_build_object('id', publisher.id, 'name', publisher.name),
		'section', jsonb_build_object('id', section.id, 'name', section.name, 'prefix', section.prefix),
		'createdAt',book.created_at,
		'covers', COALESCE(covers.list, '{}')	
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.accession as accession on book.id = accession.book_id and accession.weeded_at is null
    LEFT JOIN (SELECT book_author.book_id, COALESCE(jsonb_agg(jsonb_build_object('id', author.id, 'name', author.name)), '[]') as list
			   FROM catalog.book_author INNER JOIN catalog.author on book_author.author_id = author.id GROUP BY book_author.book_id) 
	as authors on book.id = authors.book_id
    LEFT JOIN (
		SELECT book_id, array_agg(path) as list FROM catalog.book_cover GROUP BY book_id
	) as covers on book.id = covers.book_id
	LEFT JOIN (
		SELECT book_id, string_agg(name, ', ') as concatenated, array_agg(name) as list   from catalog.search_tag GROUP BY book_id
	) as search_tag on book.id = search_tag.book_id
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 	--  1 means Pending, 2 means Approved, 3 means checked-out 
	GROUP BY 
	book.id,
	section.id,
	publisher.id,
	authors.list,
	section.id,
	publisher.id,
	search_tag.concatenated,
	search_tag.list,
    covers.list;

CREATE OR REPLACE VIEW bag_view as
SELECT bag.id , bag.book_id, bag.account_id, bag.accession_id, bag.accession_number, bag.copy_number,  bv.json_format as book, bag.is_checked,  bag.is_ebook  from ((
	SELECT bag.id, bag.account_id, bag.accession_id, accession.number as accession_number, accession.copy_number,  accession.book_id as book_id, is_checked, false as is_ebook from circulation.bag
	INNER JOIN catalog.accession as accession on bag.accession_id = accession.id and accession.weeded_at is null
)
UNION ALL
(	SELECT ebook_bag.id, account_id,  '00000000-0000-0000-0000-000000000000', 0, 0, book_id, is_checked, true as is_ebook from circulation.ebook_bag	
)) as bag
INNER JOIN book_view as bv on bag.book_id = bv.id;




CREATE OR REPLACE VIEW account_view as 
SELECT account.id, email, display_name, given_name, surname, profile_picture, deleted_at, active_since, (case when account.deleted_at is null then false else true end) as is_deleted, (case when active_since is null then false else true end) as is_active,
json_build_object( 
	'totalPenalty', COALESCE(penalty_tbl.total, 0),
	'pendingBooks', COALESCE(bb.pending_books, 0),
	'approvedBooks', COALESCE(bb.approved_books, 0),
	'checkedOutBooks', COALESCE(bb.checkedout_books, 0),
	'returnedBooks', COALESCE(bb.returned_books, 0),
	'cancelledBOoks', COALESCE(bb.cancelled_books, 0)
)
 as metadata, 
 search_vector 
 FROM system.account 
LEFT JOIN
(SELECT penalty.account_id, 
SUM(penalty.amount) as total FROM borrowing.penalty WHERE penalty.settled_at is null GROUP BY penalty.account_id) 
as penalty_tbl on account.id = penalty_tbl.account_id
LEFT JOIN  (
SELECT account_id, 
COUNT(1) filter (where status_id = 1) as pending_books,  
COUNT(1) filter (where status_id = 2) as approved_books,
COUNT(1) filter (where status_id = 3) as checkedout_books,
COUNT(1) filter (where status_id = 4) as returned_books,
COUNT(1) filter (where status_id = 5) as cancelled_books
FROM borrowed_book_all_view GROUP BY account_id
) as bb on account.id = bb.account_id
GROUP BY 
account.id, 
bb.account_id,
bb.pending_books,
bb.approved_books,
bb.returned_books,
bb.cancelled_books,
bb.checkedout_books,
penalty_tbl.account_id,
penalty_tbl.total;
