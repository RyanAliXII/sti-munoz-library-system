package repository

import (
	"slim-app/server/model"

	"github.com/jmoiron/sqlx"
)

type CirculationRepository struct {
	db *sqlx.DB
}

func (repo *CirculationRepository) GetBorrowingTransactions() []model.BorrowingTransaction {
	var transactions []model.BorrowingTransaction = make([]model.BorrowingTransaction, 0)
	query := `SELECT bt.id,display_name, account_id, bt.created_at from circulation.borrow_transaction as bt
	INNER JOIN client.account on bt.account_id = account.id`
	repo.db.Select(&transactions, query)
	return transactions
}
func NewCirculationRepository(db *sqlx.DB) CirculationRepositoryInterface {
	return &CirculationRepository{
		db: db,
	}
}

type CirculationRepositoryInterface interface {
	GetBorrowingTransactions() []model.BorrowingTransaction
}
