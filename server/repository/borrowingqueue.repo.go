package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type BorrowingQueue struct {
	db * sqlx.DB
}
type BorrowingQueueRepository interface {
	Queue(model.BorrowingQueue) error
}
func NewBorrowingQueue () BorrowingQueueRepository {
	return &BorrowingQueue{
		db: db.Connect(),
	}
}

func (repo * BorrowingQueue)Queue(queue model.BorrowingQueue) error {
	_, err := repo.db.Exec("INSERT INTO borrowing.queue (book_id, account_id) VALUES($1, $2)", queue.BookId, queue.AccountId)
	return err
}




