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
	selectTransactionQuery := `SELECT 
	bt.id, display_name, account_id, due_date, returned_at,
	bt.created_at, email, COALESCE(remarks, '') as remarks,
	find_borrowed_accession_json(bt.id) as borrowed_accessions
	from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id`
	selectErr := repo.db.Select(&transactions, selectTransactionQuery)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetBorrowingTransactions"), slimlog.Error("SelectErr"))
	}

	return transactions
}
func (repo *CirculationRepository) GetBorrowingTransactionById(id string) model.BorrowingTransaction {
	var transaction model.BorrowingTransaction = model.BorrowingTransaction{}

	query := `SELECT 
	bt.id, display_name, account_id, due_date, bt.returned_at,
	bt.created_at, email, COALESCE(remarks, '') as remarks,
	find_borrowed_accession_json(bt.id) as borrowed_accessions
	from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id
	 where bt.id = $1 LIMIT 1`

	repo.db.Get(&transaction, query, id)
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
	query := `UPDATE circulation.borrowed_book SET returned_at = now() where transaction_id = $1 AND book_id = $2 AND accession_number = $3`
	_, updateErr := repo.db.Exec(query, transactionId, bookId, accessionNumber)

	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("updateErr"))
	}
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
