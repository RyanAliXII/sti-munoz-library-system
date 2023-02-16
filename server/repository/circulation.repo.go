package repository

import (
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"
	"time"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type CirculationRepository struct {
	db *sqlx.DB
}

func (repo *CirculationRepository) GetBorrowingTransactions() []model.BorrowingTransaction {
	var transactions []model.BorrowingTransaction = make([]model.BorrowingTransaction, 0)
	selectTransactionQuery := `
	SELECT bt.id,
	json_build_object('id',account.id, 'displayName', 
	display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	COALESCE(json_agg(json_build_object('number', bb.accession_number,'bookId', bb.book_id,'copyNumber', accession.copy_number ,'returnedAt',bb.returned_at,'book', json_build_object('id', book.id,
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
		'authors',(
		COALESCE((SELECT json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
		as authors
		FROM catalog.book_author
		INNER JOIN catalog.author on book_author.author_id = catalog.author.id
		where book_id = book.id
		group by book_id),'[]')),																		 
		'created_at',book.created_at)								   
	)),'[]') as borrowed_copies,
	bt.created_at, 
	COALESCE(bt.remarks, '') as remarks,
	bt.due_date, bt.returned_at
	from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id
	INNER JOIN circulation.borrowed_book as bb on bt.id = bb.transaction_id
	INNER JOIN catalog.book on bb.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	INNER JOIN get_accession_table() as accession on bb.accession_number = accession.id AND bb.book_id = accession.book_id
	GROUP BY bt.id, account.id
	ORDER by bt.created_at DESC
	`
	selectErr := repo.db.Select(&transactions, selectTransactionQuery)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetBorrowingTransactions"), slimlog.Error("SelectErr"))
	}

	return transactions
}
func (repo *CirculationRepository) GetBorrowingTransactionById(id string) model.BorrowingTransaction {
	var transaction model.BorrowingTransaction = model.BorrowingTransaction{}

	query := `SELECT bt.id,
	json_build_object('id',account.id, 'displayName', 
	display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	COALESCE(json_agg(json_build_object('number', bb.accession_number,'bookId', bb.book_id,'copyNumber', accession.copy_number ,'returnedAt',bb.returned_at,'book', json_build_object('id', book.id,
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
		'authors',(
		COALESCE((SELECT json_agg(json_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
		as authors
		FROM catalog.book_author
		INNER JOIN catalog.author on book_author.author_id = catalog.author.id
		where book_id = book.id
		group by book_id),'[]')),																		 
		'created_at',book.created_at)								   
	)),'[]') as borrowed_copies,
	bt.created_at, 
	COALESCE(bt.remarks, '') as remarks,
	bt.due_date, bt.returned_at
	from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id
	INNER JOIN circulation.borrowed_book as bb on bt.id = bb.transaction_id
	INNER JOIN catalog.book on bb.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	INNER JOIN get_accession_table() as accession on bb.accession_number = accession.id AND bb.book_id = accession.book_id
	Where bt.id = $1
	GROUP BY bt.id, account.id
	`
	getErrr := repo.db.Get(&transaction, query, id)
	if getErrr != nil {
		logger.Error(getErrr.Error(), slimlog.Function("CirculationRepository.GetBorrowingTransactionById"), slimlog.Error("getErr"))
	}
	return transaction
}
func (repo *CirculationRepository) NewTransaction(clientId string, dueDate time.Time, accessions []model.Accession) error {
	transactionId := uuid.NewString()
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("transactErr"))
		return transactErr
	}
	query := `INSERT INTO circulation.borrow_transaction (id, account_id, due_date) VALUES($1,$2,$3)`
	insertTransactionResult, insertTransactionErr := transaction.Exec(query, transactionId, clientId, dueDate)

	if insertTransactionErr != nil {
		transaction.Rollback()
		logger.Error(insertTransactionErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("inserTransactionErr"))
		return insertTransactionErr
	}
	dialect := goqu.Dialect("postgres")
	var borrowedAccessionsRows []goqu.Record = make([]goqu.Record, 0)

	for _, accession := range accessions {
		borrowedAccessionsRows = append(borrowedAccessionsRows, goqu.Record{"transaction_id": transactionId, "accession_number": accession.Number, "book_id": accession.BookId})
	}
	accessionDs := dialect.From(goqu.T("borrowed_book").Schema("circulation")).Prepared(true).Insert().Rows(borrowedAccessionsRows)
	insertAccessionQuery, accesionArgs, _ := accessionDs.ToSQL()
	insertAccessionResult, insertAccessionErr := transaction.Exec(insertAccessionQuery, accesionArgs...)

	if insertAccessionErr != nil {
		transaction.Rollback()
		logger.Error(insertAccessionErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("insertAccessionErr"))
		return insertAccessionErr
	}
	transaction.Commit()
	insertTransactionAffectedRows, _ := insertTransactionResult.RowsAffected()
	insertAccessionAffectedRows, _ := insertAccessionResult.RowsAffected()
	logger.Info("Transaction created.", slimlog.AffectedRows(insertTransactionAffectedRows))
	logger.Info("Book borrowed inserted.", slimlog.AffectedRows(insertAccessionAffectedRows))
	return nil
}

func (repo *CirculationRepository) ReturnBooksByTransactionId(id string, remarks string) error {

	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.ReturnBooksByTransactionId"), slimlog.Error("transactErr"))
		return transactErr
	}
	updateBorrowTransactionQuery := `UPDATE circulation.borrow_transaction SET returned_at = now(), remarks= $1 where id = $2`

	updateBorrowTransactionResult, updateBorrowTransactionErr := transaction.Exec(updateBorrowTransactionQuery, remarks, id)

	if updateBorrowTransactionErr != nil {
		transaction.Rollback()
		logger.Error(updateBorrowTransactionErr.Error(), slimlog.Function("CirculationRepository.ReturnBooksByTransactionId"), slimlog.Error("updateBorrowTransactionErr"))
		return updateBorrowTransactionErr
	}
	updateBookBorrowedQuery := `UPDATE circulation.borrowed_book SET returned_at = now() where transaction_id = $1`
	updateBookBorrowResult, updateBookBorrowedErr := transaction.Exec(updateBookBorrowedQuery, id)

	if updateBookBorrowedErr != nil {
		transaction.Rollback()
		logger.Error(updateBorrowTransactionErr.Error(), slimlog.Function("CirculationRepository.ReturnBooksByTransactionId"), slimlog.Error("updateBookBorrowedErr"))
		return updateBorrowTransactionErr
	}

	transaction.Commit()
	updateBookTransactionAffected, _ := updateBorrowTransactionResult.RowsAffected()
	updateBookBorrowedAffected, _ := updateBookBorrowResult.RowsAffected()
	logger.Info("Book transaction updated.", slimlog.AffectedRows(updateBookTransactionAffected))
	logger.Info("Borrowed books update.", slimlog.AffectedRows(updateBookBorrowedAffected))
	return nil
}
func (repo *CirculationRepository) ReturnBookCopy(transactionId string, bookId string, accessionNumber int) error {
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("transactErr"))
		return transactErr
	}

	updateQuery := `UPDATE circulation.borrowed_book SET returned_at = now() where transaction_id = $1 AND book_id = $2 AND accession_number = $3`
	_, updateErr := transaction.Exec(updateQuery, transactionId, bookId, accessionNumber)
	if updateErr != nil {
		transaction.Rollback()
		logger.Error(updateErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("updateErr"))
	}

	//check if the books have been returned. If returned, mark the transaction as returned.
	checkReturnedCopyQuery := `SELECT EXISTS(SELECT 1 FROM circulation.borrowed_book where transaction_id = $1  AND returned_at is null )`
	exists := false
	transaction.Get(&exists, checkReturnedCopyQuery, transactionId)
	if !exists {
		updateBorrowTransactionQuery := `UPDATE circulation.borrow_transaction SET returned_at = now() where id = $1`
		_, updateBorrowTransactionErr := transaction.Exec(updateBorrowTransactionQuery, transactionId)
		if updateBorrowTransactionErr != nil {
			transaction.Rollback()
			logger.Error(updateBorrowTransactionErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("updateBorrowTransactionErr"))
			return updateBorrowTransactionErr
		}
	}
	transaction.Commit()
	return updateErr
}
func NewCirculationRepository(db *sqlx.DB) CirculationRepositoryInterface {
	return &CirculationRepository{
		db: db,
	}
}

type CirculationRepositoryInterface interface {
	GetBorrowingTransactions() []model.BorrowingTransaction
	GetBorrowingTransactionById(id string) model.BorrowingTransaction
	NewTransaction(clientId string, dueDate time.Time, accession []model.Accession) error
	ReturnBooksByTransactionId(id string, remarks string) error
	ReturnBookCopy(transactionId string, bookId string, accessionNumber int) error
}
