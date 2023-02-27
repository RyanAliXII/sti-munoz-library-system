package repository

import (
	"errors"
	"fmt"
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type BookRepository struct {
	db                *sqlx.DB
	sectionRepository SectionRepositoryInterface
}

func (repo *BookRepository) New(book model.Book) error {
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		logger.Error(transactErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("transactErr"))
		return transactErr
	}
	id := uuid.New().String()
	book.Id = id
	insertBookQuery := `INSERT INTO catalog.book(
		title, isbn, description, copies, pages, section_id, publisher_id, fund_source_id, cost_price, edition, year_published, received_at, id, author_number, ddc)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`

	insertBookResult, insertBookErr := transaction.Exec(insertBookQuery, book.Title, book.ISBN, book.Description, book.Copies, book.Pages,
		book.Section.Id, book.Publisher.Id, book.FundSource.Id, book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt.Time, book.Id, book.AuthorNumber, book.DDC)
	if insertBookErr != nil {
		logger.Error(insertBookErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("insertBookErr"))
		return insertBookErr
	}

	var section model.Section
	selectSectionErr := transaction.Get(&section, "SELECT  accession_table, (case when accession_table = 'accession_main' then false else true end) as has_own_accession from catalog.section where id = $1 ", book.Section.Id)
	if selectSectionErr != nil {
		transaction.Rollback()
		logger.Error(selectSectionErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("selectSectionErr"))
		return selectSectionErr

	}
	dialect := goqu.Dialect("postgres")
	const DEFAULT_ACCESSION = "accession_main"
	accession := DEFAULT_ACCESSION
	if section.HasOwnAccession {
		accession = string(section.AccessionTable)
	}
	table := fmt.Sprintf("accession.%s", accession)
	// insert book accession.
	var accessionRows []goqu.Record = make([]goqu.Record, 0)
	for i := 0; i < book.Copies; i++ {
		copyNumber := i + 1
		accessionRows = append(accessionRows, goqu.Record{"book_id": book.Id, "copy_number": copyNumber})

	}
	accessionDs := dialect.From(table).Prepared(true).Insert().Rows(accessionRows)
	insertAccessionQuery, accesionArgs, _ := accessionDs.ToSQL()
	insertAccessionResult, insertAccessionErr := transaction.Exec(insertAccessionQuery, accesionArgs...)

	if insertAccessionErr != nil {
		transaction.Rollback()
		logger.Error(insertAccessionErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("insertAccessionErr"))
		return insertAccessionErr
	}

	insertedBookRows, _ := insertBookResult.RowsAffected()
	insertedAccessionRows, _ := insertAccessionResult.RowsAffected()
	logger.Info("Added new book.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedBookRows))
	logger.Info("model.Accession added.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedAccessionRows))

	if len(book.Authors.People) > 0 {
		rows := make([]goqu.Record, 0)

		for _, p := range book.Authors.People {
			rows = append(rows, goqu.Record{"book_id": book.Id, "author_id": p.Id})
		}
		ds := dialect.From("catalog.book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert people"))
			return insertAuthorErr
		}
	}

	if len(book.Authors.Organizations) > 0 {
		rows := make([]goqu.Record, 0)

		for _, org := range book.Authors.Organizations {
			rows = append(rows, goqu.Record{"book_id": book.Id, "org_id": org.Id})
		}
		ds := dialect.From("catalog.org_book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert orgs"))
			return insertAuthorErr
		}
	}
	if len(book.Authors.Publishers) > 0 {
		rows := make([]goqu.Record, 0)

		for _, publisher := range book.Authors.Publishers {
			rows = append(rows, goqu.Record{"book_id": book.Id, "publisher_id": publisher.Id})
		}
		ds := dialect.From("catalog.publisher_book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert publisher"))
			return insertAuthorErr
		}
	}

	transaction.Commit()
	return nil
}

func (repo *BookRepository) Get() []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `
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
	json_build_object('id', source_of_fund.id, 'name', source_of_fund.name) as fund_source,
	json_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table) as section,
	json_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	json_build_object(
	'people', COALESCE((SELECT  json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
			  as authors
			  FROM catalog.book_author
			  INNER JOIN catalog.author on book_author.author_id = catalog.author.id
			  where book_id = book.id
			  group by book_id),'[]'),
		
	'organizations', COALESCE((SELECT json_agg(json_build_object('id', org.id, 'name', org.name)) 
							 FROM catalog.org_book_author as oba 
							 INNER JOIN catalog.organization as org on oba.org_id = org.id 
							  where book_id = book.id group by book_id ),'[]'),
		
	'publishers', COALESCE((SELECT json_agg(json_build_object('id', pub.id, 'name', pub.name)) 
						  FROM catalog.publisher_book_author as pba 
						  INNER JOIN catalog.publisher as pub on pba.publisher_id = pub.id 
						  where book_id = book.id group by book_id
						  ),'[]')
	) as authors,

	COALESCE(find_accession_json(COALESCE(accession_table, 'accession_main'),book.id), '[]') as accessions
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id 
	ORDER BY created_at DESC
	`
	selectErr := repo.db.Select(&books, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.Get"), slimlog.Error("SelectErr"))
	}
	return books
}
func (repo *BookRepository) GetOne(id string) model.Book {
	var book model.Book = model.Book{}
	query := `
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
	json_build_object('id', source_of_fund.id, 'name', source_of_fund.name) as fund_source,
	json_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table ) as section,
	json_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	COALESCE((SELECT  json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
	as authors
	FROM catalog.book_author
	INNER JOIN catalog.author on book_author.author_id = catalog.author.id
	where book_id = book.id
	group by book_id),'[]') as authors,
	COALESCE(find_accession_json(COALESCE(accession_table, 'accession_main'),book.id), '[]') as accessions
	 FROM catalog.book 
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	WHERE book.id = $1
	ORDER BY created_at DESC
	LIMIT 1
	`
	selectErr := repo.db.Get(&book, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.GetOne"), slimlog.Error("SelectErr"))
	}
	return book
}
func (repo *BookRepository) GetAccessions() []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)

	query := `
	SELECT accession.id as accession_number, copy_number, 
	accession.book_id,
	json_build_object(
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
		'fundSource', json_build_object('id', source_of_fund.id, 'name', source_of_fund.name),
		'publisher', json_build_object('id', publisher.id, 'name', publisher.name),
		'section', json_build_object('id', section.id, 'name', section.name),
		'created_at',book.created_at,
		'authors', (
		COALESCE((SELECT  json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
		as authors
		FROM catalog.book_author
		INNER JOIN catalog.author on book_author.author_id = catalog.author.id
		where book_id = book.id
		group by book_id),'[]'))
		
	) as book,
	(CASE WHEN accession_number is null then false else true END) as is_checked_out
	FROM get_accession_table() 
	as accession 
	INNER JOIN catalog.book on accession.book_id = book.id 
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	LEFT JOIN circulation.borrowed_book 
	as bb on accession.book_id = bb.book_id AND accession.id = bb.accession_number AND returned_at is NULL
	where accession.deleted_at is null
	ORDER BY book.created_at DESC
	`
	selectAccessionErr := repo.db.Select(&accessions, query)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccession"), slimlog.Error("selectAccessionErr"))
		return accessions
	}
	return accessions
}

func (repo *BookRepository) Update(book model.Book) error {
	oldBookRecord := repo.GetOne(book.Id)
	if len(oldBookRecord.Id) == 0 {
		return errors.New("book cannot be updated because book doesn't exist")
	}
	transaction, transactErr := repo.db.Beginx()
	dialect := goqu.Dialect("postgres")
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("transactErr"))
		return transactErr
	}

	updateBookQuery := `UPDATE catalog.book SET title = $1,  isbn = $2, description = $3, pages = $4, section_id = $5, publisher_id = $6,
	fund_source_id = $7, cost_price= $8, edition = $9, year_published = $10, received_at = $11, author_number = $12, ddc = $13 where id = $14 `

	//update book
	updateResult, updateErr := transaction.Exec(updateBookQuery, book.Title, book.ISBN, book.Description, book.Pages, book.Section.Id, book.Publisher.Id, book.FundSource.Id,
		book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt, book.AuthorNumber, book.DDC, book.Id)
	if updateErr != nil {
		transaction.Rollback()
		logger.Error(updateErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("updateErr"))
		return updateErr
	}

	//handle when book section has been updated.
	if oldBookRecord.Section.Id != book.Section.Id {
		section := model.Section{}
		//get details about the section
		newSectionGetErr := transaction.Get(&section, "Select accession_table from catalog.section where id = $1", book.Section.Id)
		fmt.Println(section)
		if newSectionGetErr != nil {
			transaction.Rollback()
			logger.Error(newSectionGetErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("newSectionGetErr"))
			return newSectionGetErr
		}
		// get all copies
		selectCopiesDs := dialect.From(goqu.T(oldBookRecord.Section.AccessionTable).Schema("accession")).Prepared(true).Select(
			goqu.C("id").As("accession_number"), goqu.C("copy_number"), goqu.C("book_id"),
		).Where(goqu.Ex{
			"book_id": book.Id,
		})
		selectCopiesQuery, selectCopiesArgs, _ := selectCopiesDs.ToSQL()
		accessions := make([]model.Accession, 0)
		selectAccessionErr := transaction.Select(&accessions, selectCopiesQuery, selectCopiesArgs...)
		if selectAccessionErr != nil {
			transaction.Rollback()
			logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("selectAccessionErr"))
			return selectAccessionErr
		}
		accessionRows := make([]goqu.Record, 0)
		for _, accession := range accessions {
			accessionRows = append(accessionRows, goqu.Record{"book_id": accession.BookId, "copy_number": accession.CopyNumber})
		}
		//transfer copies to the section acccession table.
		insertCopiesDs := dialect.From(goqu.T(section.AccessionTable).Schema("accession")).Prepared(true).Insert().Rows(accessionRows)
		insertCopiesQuery, insertCopiesArgs, _ := insertCopiesDs.ToSQL()
		insertResult, insertCopiesErr := transaction.Exec(insertCopiesQuery, insertCopiesArgs...)

		if insertCopiesErr != nil {
			transaction.Rollback()
			logger.Error(insertCopiesErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("insertCopiesErr"))
			return insertCopiesErr
		}
		deleteOldCopiesDs := dialect.From(goqu.T(oldBookRecord.Section.AccessionTable).Schema("accession")).Prepared(true).Delete().Where(exp.Ex{
			"book_id": book.Id,
		})
		//delete copies from old accession table
		deleteOldCopiesQuery, deleteOldCopiesArgs, _ := deleteOldCopiesDs.ToSQL()
		deleteOldCopiesResult, deleteCopiesErr := transaction.Exec(deleteOldCopiesQuery, deleteOldCopiesArgs...)
		if deleteCopiesErr != nil {
			transaction.Rollback()
			logger.Error(deleteCopiesErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("insertCopiesErr"))
			return insertCopiesErr
		}
		insertedCopiesAffectedRows, _ := insertResult.RowsAffected()
		deletedOldCopiesAffectedRows, _ := deleteOldCopiesResult.RowsAffected()
		logger.Info("Tranferred copies.", slimlog.AffectedRows(deletedOldCopiesAffectedRows))
		logger.Info("Book copies inserted.", slimlog.AffectedRows(insertedCopiesAffectedRows))

	}
	deleteResult, deleteErr := transaction.Exec("DELETE FROM catalog.book_author where book_id = $1", book.Id)
	if deleteErr != nil {
		transaction.Rollback()
		logger.Error(deleteErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("deleteErr"))
		return deleteErr
	}

	// var authorRows []goqu.Record = make([]goqu.Record, 0)
	// for _, author := range book.Authors {
	// 	authorRows = append(authorRows, goqu.Record{"book_id": book.Id, "author_id": author.Id})
	// }
	// authorDs := dialect.From("catalog.book_author").Prepared(true).Insert().Rows(authorRows)
	// insertAuthorQuery, authorArgs, _ := authorDs.ToSQL()
	// insertAuthorResult, insertAuthorErr := transaction.Exec(insertAuthorQuery, authorArgs...)
	// if insertAuthorErr != nil {
	// 	transaction.Rollback()
	// 	logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("insertAuthorErr"))
	// 	return insertAuthorErr
	// }

	// insertedAuthorRows, _ := insertAuthorResult.RowsAffected()
	deleteAuthorRows, _ := deleteResult.RowsAffected()
	updatedBookRows, _ := updateResult.RowsAffected()

	logger.Info("Book updated.", slimlog.AffectedRows(updatedBookRows))
	logger.Info("Author deleted.", slimlog.AffectedRows(deleteAuthorRows))
	// logger.Info("Author updated.", slimlog.AffectedRows(insertedAuthorRows))
	transaction.Rollback()
	return nil
}
func (repo *BookRepository) Search(filter Filter) []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `
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
	json_build_object('id', source_of_fund.id, 'name', source_of_fund.name) as fund_source,
	json_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end)) as section,
	json_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	COALESCE((SELECT  json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
	as authors
	FROM catalog.book_author
	INNER JOIN catalog.author on book_author.author_id = catalog.author.id
	where book_id = book.id
	group by book_id),'[]') as authors,
	COALESCE(find_accession_json(COALESCE(accession_table, 'accession_main'),book.id), '[]') as accessions
	 FROM catalog.book 
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	WHERE search_vector @@ websearch_to_tsquery('english', $1) OR search_vector @@ plainto_tsquery('simple', $1)
	ORDER BY book.created_at desc
	LIMIT $2 OFFSET $3
	`
	selectErr := repo.db.Select(&books, query, filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepository.Search"), slimlog.Error("selectErr"))
	}
	return books
}

func (repo *BookRepository) GetAccessionsByBookId(id string) []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)
	query := `
	SELECT accession.id as accession_number, copy_number, 
	accession.book_id,
	json_build_object(
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
		'fundSource', json_build_object('id', source_of_fund.id, 'name', source_of_fund.name),
		'publisher', json_build_object('id', publisher.id, 'name', publisher.name),
		'section', json_build_object('id', publisher.id, 'name', publisher.name),
		'created_at',book.created_at,
		'authors', (
		COALESCE((SELECT  json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
		as authors
		FROM catalog.book_author
		INNER JOIN catalog.author on book_author.author_id = catalog.author.id
		where book_id = book.id
		group by book_id),'[]'))
		
	) as book,
	(CASE WHEN accession_number is null then false else true END) as is_checked_out
	FROM get_accession_table() 
	as accession 
	INNER JOIN catalog.book on accession.book_id = book.id 
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	LEFT JOIN circulation.borrowed_book 
	as bb on accession.book_id = bb.book_id AND accession.id = bb.accession_number AND returned_at is NULL
    WHERE book.id = $1
	ORDER BY book.created_at DESC
	`

	selectAccessionErr := repo.db.Select(&accessions, query, id)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccessionByBookId"), slimlog.Error("selectAccessionErr"))
		return accessions
	}
	return accessions
}
func NewBookRepository() BookRepositoryInterface {
	logger.Info("BOOK REPO INIT")
	return &BookRepository{
		db:                postgresdb.GetOrCreateInstance(),
		sectionRepository: NewSectionRepository(),
	}
}

type BookRepositoryInterface interface {
	New(model.Book) error
	Get() []model.Book
	GetOne(id string) model.Book
	GetAccessions() []model.Accession
	Update(model.Book) error
	Search(Filter) []model.Book
	GetAccessionsByBookId(id string) []model.Accession
}
