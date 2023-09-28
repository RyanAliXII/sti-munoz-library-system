 CREATE OR REPLACE VIEW book_view as 
	SELECT book.id,title, isbn, 
	description, 
	pages,
	cost_price,
	edition,
	count(accession) as copies,
	year_published,
	received_at,
	ddc,
	author_number,
	book.created_at,
	jsonb_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table, 'prefix', section.prefix) as section,
	jsonb_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	COALESCE(jsonb_agg(jsonb_build_object('id', accession.id, 'number', accession.number, 'copyNumber', accession.copy_number, 'isAvailable', (CASE WHEN bb.accession_id is not null then false else true END) )), '[]') as accessions,
	COALESCE(jsonb_agg(json_build_object('id', author.id, 'name', author.name)), '[]') as authors,
	COALESCE((SELECT array_agg(path) FROM catalog.book_cover where book_id = book.id), '{}') as covers,
	jsonb_build_object(
		'id', book.id,
		'title', book.title,
		'description', book.description,
		'ddc', book.ddc,
		'authorNumber', book.author_number,
		'isbn', book.isbn,
		'pages', book.pages,
		'costPrice', book.cost_price,
		'edition', book.edition,
		'yearPublished', book.year_published,
		'receivedAt', book.received_at,
		'publisher', jsonb_build_object('id', publisher.id, 'name', publisher.name),
		'section', jsonb_build_object('id', section.id, 'name', section.name, 'prefix', section.prefix),
		'createdAt',book.created_at,
		'covers', COALESCE((SELECT array_agg(path) FROM catalog.book_cover where book_id = book.id), '{}')
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.accession as accession on book.id = accession.book_id
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3 OR status_id = 6) 	--  1 means Pending, 2 means Approved, 3 means checked-out 
	LEFT JOIN (SELECT author.id, author.name, book_author.book_id FROM catalog.book_author INNER JOIN catalog.author on book_author.author_id = author.id) as author on book.id = author.book_id
	GROUP BY 
	book.id,
	section.id,
	publisher.id;


CREATE OR REPLACE VIEW borrowed_book_view as 
SELECT bb.id, bb.group_id, bb.account_id, bb.accession_id, bb.due_date, accession.number, bb.remarks,
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