DROP VIEW IF EXISTS penalty_view;
DROP VIEW IF EXISTS reservation_view;
DROP VIEW IF EXISTS account_view;
DROP VIEW IF EXISTS borrowed_book_all_view;
DROP VIEW IF EXISTS borrowed_book_view;
DROP VIEW IF EXISTS bag_view;
DROP VIEW IF EXISTS borrowed_ebook_view;
DROP VIEW IF EXISTS book_view;
DROP VIEW IF EXISTS client_book_view;
DROP VIEW IF EXISTS item_view;



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
    book.section_id,
    book.ebook,
    book.subject,
    authors.concatenated as authors_concatenated,
	author_number,
	book.created_at,
	authors.list as authors,
	COALESCE(covers.list,'{}') as covers,
	setweight(to_tsvector('english', search_tag.concatenated), 'A') :: tsvector search_tag_vector,  
	COALESCE(search_tag.list, '{}' ) as search_tags,
	jsonb_build_object('id', section.id, 'name', section.name,'prefix', section.prefix, 'isNonCirculating', section.is_non_circulating) as section,
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
		'section', jsonb_build_object('id', section.id, 'name', section.name, 'prefix', section.prefix,'isNonCirculating', section.is_non_circulating),
		'createdAt',book.created_at,
		'covers', COALESCE(covers.list,'{}')
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.accession as accession on book.id = accession.book_id
    LEFT JOIN (SELECT book_author.book_id, string_agg(name, ', ') as concatenated, COALESCE(jsonb_agg(jsonb_build_object('id', author.id, 'name', author.name)), '[]') as list
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
	where book.deleted_at is null
	GROUP BY 
	book.id,
	section.id,
	publisher.id,
	authors.list,
    authors.concatenated,
	section.id,
	covers.list,
	publisher.id,
	search_tag.concatenated,
	search_tag.list;
	

CREATE OR REPLACE VIEW borrowed_book_view as 
SELECT bb.id, bb.group_id, bb.account_id, bb.accession_id, bb.due_date, accession.number, accession.book_id, bb.remarks,
accession.copy_number,bb.status_id, bs.description as status ,book.json_format as book, 
account.json_format as client, account.search_vector  as account_search_vector,
	(case when due_date is null or status_id != 3  then 0 else (
	 case when (now()::date - due_date) < 0 then 0 else (now()::date - due_date) end
	) end) * penalty_on_past_due as penalty,
	bb.created_at
	FROM borrowing.borrowed_book as bb
	INNER JOIN catalog.accession as accession on bb.accession_id = accession.id
	INNER JOIN book_view as book on accession.book_id = book.id 
	INNER JOIN (
    SELECT 
     account.id,
     account.search_vector,
     jsonb_build_object('id', account.id, 
	'givenName', account.given_name,
	 'surname', account.surname, 
	'displayName',account.display_name,
	 'email', account.email,
	 'profilePicture', account.profile_picture,
     'studentNumber', account.student_number,
    'programName', (case when user_program.name is null then '' else user_program.name end), 
    'programCode', (case when user_program.code is null then '' else user_program.code end),
    'userType', (case when program_id is null and type_id is null then '' else 
    (case when program_id is not null then user_program.user_type else user_type.name end) end)
) as json_format
FROM system.account
LEFT JOIN system.user_type on account.type_id = user_type.id
LEFT JOIN (
	SELECT user_program.id,user_program.name, code, user_type.name as user_type, user_type_id, user_type.max_allowed_borrowed_books, JSONB_BUILD_OBJECT(
	'id', user_type.id,
	'name', user_type.name,
	'hasProgram', user_type.has_program
 ) as user_group   from system.user_program
   INNER JOIN system.user_type on user_type_id  =  user_type.id
) as user_program on program_id = user_program.id
) as account on bb.account_id = account.id
INNER JOIN borrowing.borrow_status as bs on bb.status_id = bs.id
ORDER BY bb.created_at desc;




CREATE OR REPLACE VIEW borrowed_ebook_view as 
SELECT  be.id, be.book_id, be.due_date, be.status_id, bs.description as status,
be.account_id, be.group_id, be.created_at , account.json_format as client,
book.json_format as book, account.search_vector as account_search_vector
FROM borrowing.borrowed_ebook as be
INNER JOIN (
SELECT 
account.id,
account.search_vector,
jsonb_build_object('id', account.id, 
	'givenName', account.given_name,
	 'surname', account.surname, 
	'displayName',account.display_name,
	 'email', account.email,
	 'profilePicture', account.profile_picture,
     'studentNumber', account.student_number,
    'programName', (case when user_program.name is null then '' else user_program.name end), 
    'programCode', (case when user_program.code is null then '' else user_program.code end),
    'userType', (case when program_id is null and type_id is null then '' else 
    (case when program_id is not null then user_program.user_type else user_type.name end) end)
) as json_format

FROM system.account
LEFT JOIN system.user_type on account.type_id = user_type.id
LEFT JOIN (
	SELECT user_program.id,user_program.name, code, user_type.name as user_type, user_type_id, user_type.max_allowed_borrowed_books, JSONB_BUILD_OBJECT(
	'id', user_type.id,
	'name', user_type.name,
	'hasProgram', user_type.has_program
) as user_group   from system.user_program
INNER JOIN system.user_type on user_type_id  =  user_type.id
) as user_program on program_id = user_program.id
) as account on be.account_id = account.id
INNER JOIN book_view as book on be.book_id = book.id 
INNER JOIN borrowing.borrow_status as bs on be.status_id = bs.id;


CREATE OR REPLACE VIEW borrowed_book_all_view as 
((SELECT id, group_id,client,account_id,book, status, status_id, accession_id, number,book_id, copy_number,  penalty, due_date, remarks, false as is_ebook, account_search_vector, created_at  from borrowed_book_view ) 
	UNION ALL 
(SELECT id, group_id,client,account_id, book, status, status_id, '00000000-0000-0000-0000-000000000000', 0, book_id,0,0.00, due_date, '', true as is_ebook, account_search_vector, created_at
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
    book.section_id,
    authors.concatenated as authors_concatenated,
	authors.list as authors,
	setweight(to_tsvector('english', search_tag.concatenated), 'A') :: tsvector search_tag_vector,  
	COALESCE(search_tag.list, '{}' ) as search_tags,
	jsonb_build_object('id', section.id, 'name', section.name,'prefix', section.prefix, 'isNonCirculating', section.is_non_circulating) as section,
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
		'section', jsonb_build_object('id', section.id, 'name', section.name, 'prefix', section.prefix, 'isNonCirculating', section.is_non_circulating),
		'createdAt',book.created_at,
		'covers', COALESCE(covers.list, '{}')	
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.accession as accession on book.id = accession.book_id and accession.weeded_at is null and missing_at is null
    LEFT JOIN (SELECT book_author.book_id, string_agg(name, ', ') as concatenated, COALESCE(jsonb_agg(jsonb_build_object('id', author.id, 'name', author.name)), '[]') as list
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
	where book.deleted_at is null
	GROUP BY 
	book.id,
	section.id,
	publisher.id,
	authors.list,
	section.id,
	publisher.id,
	search_tag.concatenated,
	search_tag.list,
    authors.concatenated, 
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
SELECT 
account.id, 
email, 
display_name, 
given_name, 
surname, 
account.created_at, 
updated_at, 
search_vector,
profile_picture,
deleted_at,
student_number,
(CASE WHEN program_id is not null then COALESCE(user_program.max_allowed_borrowed_books, 0) else COALESCE(user_type.max_allowed_borrowed_books, 0) end) as max_allowed_borrowed_books,
(CASE WHEN program_id is not null then COALESCE(user_program.max_unique_device_reservation_per_day, 0) else COALESCE(user_type.max_unique_device_reservation_per_day, 0) end) as max_unique_device_reservation_per_day,
(CASE WHEN program_id is not null then user_program.user_type_id else type_id end) as type_id,
program_id,
active_until,
(CASE 
    WHEN program_id IS NOT NULL THEN user_program.user_group
    ELSE JSONB_BUILD_OBJECT(
        'id', COALESCE(user_type.id, 0),
        'name', COALESCE(user_type.name, ''),
        'hasProgram', COALESCE(user_type.has_program, false)
    )
END) AS user_group,

JSONB_BUILD_OBJECT(
    'id', COALESCE(user_program.id, 0),
    'name', COALESCE(user_program.name, ''),
    'code', COALESCE(user_program.code, '')
) AS program,
(case when active_until is not null and active_until > date(now() at time zone 'PHT') then true else false end) as is_active,
(case when program_id is null and type_id is null then '' else 
(case when program_id is not null then user_program.user_type else user_type.name end) end) as user_type,
(case when user_program.code is null then '' else user_program.code end) as program_code,
(case when user_program.name is null then '' else user_program.name end) as program_name,
(case when deleted_at is null then false else true end) as is_deleted,
jsonb_build_object('id', account.id, 
	'givenName', account.given_name,
	 'surname', account.surname, 
	'displayName',account.display_name,
	 'email', account.email,
	 'profilePicture', account.profile_picture,
     'studentNumber', account.student_number,
    'programName', (case when user_program.name is null then '' else user_program.name end), 
    'programCode', (case when user_program.code is null then '' else user_program.code end),
    'userType', (case when program_id is null and type_id is null then '' else 
    (case when program_id is not null then user_program.user_type else user_type.name end) end)
) as json_format,
jsonb_build_object( 
	'totalPenalty', COALESCE(penalty_tbl.total, 0),
	'pendingBooks', COALESCE(bb.pending_books, 0),
	'approvedBooks', COALESCE(bb.approved_books, 0),
	'checkedOutBooks', COALESCE(bb.checkedout_books, 0),
	'returnedBooks', COALESCE(bb.returned_books, 0),
	'cancelledBOoks', COALESCE(bb.cancelled_books, 0)
)
 as metadata
FROM system.account
LEFT JOIN system.user_type on account.type_id = user_type.id
LEFT JOIN (
	SELECT user_program.id,user_program.name, code, user_type.name as user_type, user_type_id, user_type.max_allowed_borrowed_books, user_type.max_unique_device_reservation_per_day, JSONB_BUILD_OBJECT(
	'id', user_type.id,
	'name', user_type.name,
	'hasProgram', user_type.has_program
) as user_group   from system.user_program
INNER JOIN system.user_type on user_type_id  =  user_type.id
) as user_program on program_id = user_program.id
LEFT JOIN
(
SELECT penalty.account_id, 
SUM(COALESCE(pc.amount, penalty.amount)) as total FROM borrowing.penalty
LEFT JOIN fee.penalty_classification as pc on penalty.class_id = pc.id
WHERE penalty.settled_at is null GROUP BY penalty.account_id
) 
as penalty_tbl on account.id = penalty_tbl.account_id
LEFT JOIN  (
SELECT account_id, 
COUNT(1) filter (where status_id = 1) as pending_books,  
COUNT(1) filter (where status_id = 2) as approved_books,
COUNT(1) filter (where status_id = 3) as checkedout_books,
COUNT(1) filter (where status_id = 4) as returned_books,
COUNT(1) filter (where status_id = 5) as cancelled_books
FROM borrowed_book_all_view GROUP BY account_id
) as bb on account.id = bb.account_id;


CREATE OR REPLACE VIEW item_view as 
SELECT  * FROM (SELECT book.id,title as name, 'book'  as type, description, search_vector,created_at FROM catalog.book
UNION ALL
SELECT game.id, name, 'game'  as type, description,  search_vector,created_at FROM services.game
UNION ALL
SELECT device.id, name, 'device' as type, description,  search_vector,created_at from services.device) as items ;


CREATE OR REPLACE VIEW reservation_view AS
SELECT reservation.id, reservation.date_slot_id, 
	reservation.time_slot_id, reservation.device_id, 
	reservation.account_id, 
	remarks,
	status_id,
	date_slot.date as reservation_date,
	time_slot.start_time as reservation_time,
	(reservation_status.description) as status,
	account.json_format as client,	
	JSONB_BUILD_OBJECT(
	'id', date_slot.id ,
	'date', date_slot.date
	) as date_slot,
	JSONB_BUILD_OBJECT(
	'id', time_slot.id, 
	'startTime', time_slot.start_time,
	'endTime', time_slot.end_time,
	'profileId', time_slot.profile_id
	) as time_slot, 
	JSONB_BUILD_OBJECT(
	'id', device.id, 
	'name', device.name,
	'description', device.description
	) as device, 
	reservation.created_at 
	from services.reservation
	INNER JOIN services.date_slot on date_slot_id = date_slot.id and date_slot.deleted_at is null
	INNER JOIN services.time_slot on time_slot_id = time_slot.id and time_slot.deleted_at is null
	INNER JOIN services.device on device_id = device.id and device.deleted_at is null
	INNER JOIN account_view as account on reservation.account_id = account.id
	INNER JOIN services.reservation_status on status_id = reservation_status.id;

CREATE OR REPLACE VIEW penalty_view AS
SELECT penalty.id, 
    account_id, 
	to_char(penalty.created_at, 'YYYYMMDDHH24MISS') as reference_number,
	item ,settled_at,
	proof,
    (case when class_id is null then '00000000-0000-0000-0000-000000000000' else class_id end) as class_id,
	remarks,
	JSONB_BUILD_OBJECT('id', COALESCE(pc.id, '00000000-0000-0000-0000-000000000000'), 
					    'name', COALESCE(pc.name,''),
					   'description', COALESCE(pc.description,''),
					  	'amount', COALESCE(pc.amount, 0)
	) as classification,
	(case when penalty.class_id is not null then pc.amount else penalty.amount end) as amount,
	(case when penalty.class_id is not null then pc.description else penalty.description end) as description,
	penalty.created_at, account.json_format as account,
	(case when settled_at is not null then true else false end) as is_settled
	FROM borrowing.penalty inner join account_view as account on penalty.account_id = account.id
	LEFT JOIN fee.penalty_classification as pc on penalty.class_id = pc.id
	ORDER BY created_at DESC;
	