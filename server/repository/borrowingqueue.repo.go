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
	GetClientActiveQueues(accountId string) ([]model.BorrowingQueue, error)
	GetActiveQueuesGroupByBook()([]model.BorrowingQueue, error)
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

	hasAvailableCopy := true
	err = transaction.Get(&hasAvailableCopy,`SELECT EXISTS( SELECT 
		FROM catalog.accession
		INNER JOIN book_view as book on accession.book_id = book.id 
		LEFT JOIN borrowing.borrowed_book
		as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3)
		where weeded_at is null and (CASE WHEN bb.accession_id is not null then false else true END) = true and book_id = $1)`, queue.BookId)
	

	if err != nil {
		transaction.Rollback()
		return err
	}
	if(hasAvailableCopy) {
		transaction.Rollback()
		return fmt.Errorf("book has available copy, no need to queue")
	}
	_, err = transaction.Exec("INSERT INTO borrowing.queue (book_id, account_id) VALUES($1, $2)", queue.BookId, queue.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}	
	transaction.Commit()
	return nil
}


func (repo * BorrowingQueue)GetClientActiveQueues(accountId string) ([]model.BorrowingQueue, error) {
	queues := make([]model.BorrowingQueue, 0)
	query := `
	SELECT queue.id, queue.book_id, account_id, json_format as book, 
	json_build_object('id', account.id, 
		'givenName', account.given_name,
		 'surname', account.surname, 
		'displayName',account.display_name,
		 'email', account.email,
		 'profilePicture', account.profile_picture
	) as client from borrowing.queue
	INNER JOIN book_view on queue.book_id = book_view.id
	INNER JOIN system.account on queue.account_id = account.id
	where queue.account_id = $1
	`
	err := repo.db.Select(&queues, query, accountId)
	if err != nil {
		return queues, err 
	}
	return queues, err
}


func (repo * BorrowingQueue)GetActiveQueuesGroupByBook()([]model.BorrowingQueue, error) {
	queues := make([]model.BorrowingQueue, 0)
	query := `
	SELECT queue.id, queue.book_id, account_id, json_format as book
	from borrowing.queue
	INNER JOIN book_view on queue.book_id = book_view.id
	GROUP BY queue.book_id
	`
	err := repo.db.Select(&queues, query, )
	if err != nil {
		return queues, err 
	}
	return queues, err
}





