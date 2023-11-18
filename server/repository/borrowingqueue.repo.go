package repository

import (
	"fmt"

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
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	//Check if book is already queued by client
	isAlreadyQueued := true
	err = transaction.Get(&isAlreadyQueued, "SELECT exists(SELECT 1 FROM borrowing.queue where account_id = $1 and book_id = $2 and dequeued_at is null)", queue.AccountId, queue.BookId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	if (isAlreadyQueued){
		transaction.Rollback()
		return fmt.Errorf("client is already on queue")
	}
	
	_, err = transaction.Exec("INSERT INTO borrowing.queue (book_id, account_id) VALUES($1, $2)", queue.BookId, queue.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}	
	transaction.Commit()
	return nil
}




