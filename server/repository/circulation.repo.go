package repository

import (
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/jmoiron/sqlx"
)

type CirculationRepository struct {
	db *sqlx.DB
}

func (repo *CirculationRepository) GetBorrowingTransactions() []model.BorrowingTransaction {
	var transactions []model.BorrowingTransaction = make([]model.BorrowingTransaction, 0)
	selectTransactionQuery := `SELECT 
	bt.id, display_name, account_id, 
	bt.created_at, email, 
	find_borrowed_accession_json(bt.id) as borrowed_accessions
	from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id`
	selectErr := repo.db.Select(&transactions, selectTransactionQuery)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Error("GEt"))
	}

	return transactions
}
func (repo *CirculationRepository) GetBorrowingTransactionById(id string) model.BorrowingTransaction {
	var transaction model.BorrowingTransaction = model.BorrowingTransaction{}

	query := `SELECT 
	bt.id, display_name, account_id, 
	bt.created_at, email, 
	find_borrowed_accession_json(bt.id) as borrowed_accessions
	from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id
	 where bt.id = $1 LIMIT 1`

	repo.db.Get(&transaction, query, id)
	return transaction
}
func NewCirculationRepository(db *sqlx.DB) CirculationRepositoryInterface {
	return &CirculationRepository{
		db: db,
	}
}

type CirculationRepositoryInterface interface {
	GetBorrowingTransactions() []model.BorrowingTransaction
	GetBorrowingTransactionById(id string) model.BorrowingTransaction
}
