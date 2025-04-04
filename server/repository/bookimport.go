package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"unicode"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/google/uuid"
)


type DuplicateError struct {
	Books []model.BookImport
	From string 
	Err error
}
func (e * DuplicateError) Error() string {
	return e.Err.Error()
}
func (repo *Book)ImportBooks(books []model.BookImport, sectionId int) error{
	err := repo.validateDuplicateFromFile(books)
	if err != nil {
		return err
	}
	err = repo.validateDuplicateFromDb(books, sectionId)
	if err != nil {
		return err	
	}
	var bookTitleId string;
	var lastBookTitleId string;
	var lastBookId string
	var maxAccessionNumber int;
	var copyNumber = 1

	var authorStore map[string]string = make(map[string]string)
	var publisherStore map[string]string = map[string]string{}
	dialect := goqu.Dialect("postgres")
	if (len(books) == 0){
			return nil
	}
	transaction, err  := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	authorRows := make([]goqu.Record, 0)
	publisherRows := make([]goqu.Record, 0)
	bookRows := make([]goqu.Record, 0)
	bookAuthorRows := make([]goqu.Record, 0)
	accessionRows := make([]goqu.Record, 0)
	
	for _, book := range books {
		if(book.AccessionNumber > maxAccessionNumber ){
				maxAccessionNumber = book.AccessionNumber
		}
		authorNameTrimmed := strings.TrimSpace(book.Author)
		publisherNameTrimmed := strings.TrimSpace(book.Publisher)
		bookTitleId = strings.Map(func(r rune) rune {
			if(unicode.IsSpace(r)){
					return -1
				}
				return unicode.To(unicode.LowerCase, r)
		}, book.Title)
		if authorNameTrimmed == "" {
			authorNameTrimmed= "Unknown"
		}
		if publisherNameTrimmed == "" {
			publisherNameTrimmed = "Unknown"
		}
		if book.Title ==  ""{
			book.Title = "Untitled"
		}
		

		authorId, isAuthorStored := authorStore[authorNameTrimmed];
		publisherId, isPublisherStored := publisherStore[publisherNameTrimmed]
		if !isAuthorStored {
			err := transaction.Get(&authorId, "SELECT id from catalog.author where name = $1 LIMIT 1", authorNameTrimmed)
			if err != nil  && err != sql.ErrNoRows {
				transaction.Rollback()
				return err
			}
			if len(authorId) == 0 {
				id, err  := uuid.NewUUID()
				if err != nil {
					transaction.Rollback()
					return err
				}
				authorId = id.String()
				authorRows = append(authorRows, goqu.Record{
					"id":  authorId,
					"name": authorNameTrimmed,
				})
				
			}
			authorStore[authorNameTrimmed] = authorId
		}
		if !isPublisherStored {
			err = transaction.Get(&publisherId, "SELECT id from catalog.publisher where name = $1 LIMIT 1", publisherNameTrimmed)
			if err != nil && err != sql.ErrNoRows {
				transaction.Rollback()
				return err
			}
			if len(publisherId) == 0 {
				id, err  := uuid.NewUUID()
				if err != nil {
					transaction.Rollback()
					return err
				}
				publisherId = id.String()
				publisherRows = append(publisherRows, goqu.Record{
					"id":  publisherId,
					"name": publisherNameTrimmed,
				})
			}
			publisherStore[publisherNameTrimmed] = publisherId
		}
		if(bookTitleId != lastBookTitleId){
			id, err := uuid.NewUUID()
			if err != nil {
				transaction.Rollback()
				return err
			}
			lastBookId = id.String()
			copyNumber = 1
			bookRows = append(bookRows, goqu.Record{
				"id": lastBookId,
				"title": book.Title,
				"publisher_id" : publisherId,
				"section_id" :sectionId,
				"year_published": book.YearPublished,
				"ddc": book.DDC,
				"author_number": book.AuthorNumber,
				"edition": book.Edition,
				"cost_price": book.CostPrice,
				"isbn": book.ISBN,
				"source_of_fund": book.SourceOfFund,
			})
			bookAuthorRows = append(bookAuthorRows, goqu.Record{
				"book_id":  lastBookId,
				"author_id": authorId,
			})
		}
		accessionRows = append(accessionRows, goqu.Record{
				"book_id": lastBookId,
				"number" : book.AccessionNumber,
				"copy_number" : copyNumber,
				"section_id" :sectionId,
		})
		copyNumber ++;
		lastBookTitleId = bookTitleId
	 }
	accesionCounter := model.AccessionCounter{}
  
	err = transaction.Get(&accesionCounter, "SELECT accession, last_value FROM catalog.section INNER JOIN accession.counter on section.accession_table = counter.accession where id = $1", sectionId)
	if err != nil {
		transaction.Rollback()
		return fmt.Errorf("get accession counter: %s", err.Error())
	}
	if maxAccessionNumber > accesionCounter.LastValue {
		_, err = transaction.Exec("UPDATE accession.counter set last_value = $1 where accession = $2", maxAccessionNumber, accesionCounter.Accession)
		if err  != nil {
			transaction.Rollback()
			return fmt.Errorf("update accession: %s", err.Error())
		}
	}
	if(len(authorRows) > 0){
		authorDs := dialect.From(goqu.T("author").Schema("catalog")).Prepared(true).Insert().Rows(authorRows)
		query, args, _ := authorDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert authors: %s", err.Error())
		}
	}
	if(len(publisherRows) > 0){
		publisherDs := dialect.From(goqu.T("publisher").Schema("catalog")).Prepared(true).Insert().Rows(publisherRows)
		query, args, _ := publisherDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert publisher: %s", err.Error())
		}
	}
   if(len(bookRows) > 0){
	bookDs := dialect.From(goqu.T("book").Schema("catalog")).Prepared(true).Insert().Rows(bookRows)
	query, args, _ := bookDs.ToSQL()
	_, err = transaction.Exec(query, args...)
	if err  != nil {	
		transaction.Rollback()
		return fmt.Errorf("insert book: %s", err.Error())
	}
   }
	if(len(bookAuthorRows) > 0){
		bookAuthorDs := dialect.From(goqu.T("book_author").Schema("catalog")).Prepared(true).Insert().Rows(bookAuthorRows)
		query, args, _ := bookAuthorDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert book_author: %s", err.Error())
		}
	}
	if(len(accessionRows) > 0){
		accessionDs := dialect.From(goqu.T("accession").Schema("catalog")).Prepared(true).Insert().Rows(accessionRows)
		query, args, _ := accessionDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert accession: %s", err.Error())
		}
	}

   	transaction.Commit()
	return nil
}

func (repo *Book)validateDuplicateFromFile(books []model.BookImport)error{
	withDuplicates := make([]model.BookImport, 0)
	bookCache := make(map[int]struct{}, 0)
	for _, book := range books {
		_, isAlreadyExists := bookCache[book.AccessionNumber]
		if isAlreadyExists {
			withDuplicates = append(withDuplicates, book )
		}
		bookCache[book.AccessionNumber] = struct{}{}
	}
	if len(withDuplicates) > 0 {
		return &DuplicateError{
			Books: withDuplicates,
			From: "file",
			Err: errors.New("duplicate accession number exists from file"),
		}
	}
	return nil
}

func (repo *Book)validateDuplicateFromDb(book []model.BookImport, sectionId int) error {

	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	dialect := goqu.Dialect("postgres")
	accessionTable := ""
	err = transaction.Get(&accessionTable, "SELECT accession_table from catalog.section where id = $1", sectionId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	records := make([]goqu.Record,0)
	for _,book := range book {
		records = append(records, goqu.Record{
			"accession_number": book.AccessionNumber,
			"accession_table":  accessionTable,
		})
	}
	ds := dialect.Insert(goqu.T("temp_book").Schema("catalog")).Rows(records).Prepared(true)
	query, args, err := ds.ToSQL()

	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec(query, args...)
	if err != nil {
		transaction.Rollback()
		return err
	}
	books := make([]model.BookImport, 0)
	query = `SELECT accession_number as accession FROM catalog.temp_book INNER JOIN (
		SELECT number, section.accession_table FROM catalog.accession
		INNER JOIN catalog.section on accession.section_id = section.id
	) as accession on temp_book.accession_number = accession.number AND temp_book.accession_table =  accession.accession_table`

	err = transaction.Select(&books, query)
	if err != nil {
		transaction.Rollback()
		return err
	}
	
	if len(books) > 0 {
		transaction.Rollback()
		return &DuplicateError{
				Books: books,
				From: "db",
				Err: errors.New("accession number already exists in the collection"),
		}
	}
	transaction.Rollback()
	return nil
}


