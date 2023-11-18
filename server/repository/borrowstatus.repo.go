package repository

import (
	"database/sql"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

func (repo * Borrowing)handlePenaltyCreation(id string, transaction * sqlx.Tx) error{
	
	borrowedBook := model.BorrowedBook{}
	err := transaction.Get(&borrowedBook,"SELECT id, account_id, penalty, book, accession_id, due_date, created_at FROM borrowed_book_view where id = $1", id)
	if err != nil {
		return err
	}
	if borrowedBook.Penalty > 0 {
		borrowedDate := fmt.Sprintf("%s %d %d", borrowedBook.CreatedAt.Month(), borrowedBook.CreatedAt.Day(), borrowedBook.CreatedAt.Year())
		description := fmt.Sprintf(`
You have borrowed a book in the library on %s. The book "%s"  was due on %s. Unfortunately, it has  been returned late, incurring a late fee of %.2f.
Please settle the fee in the cashier. Thank you.`,borrowedDate, borrowedBook.Book.Title, borrowedBook.DueDate, borrowedBook.Penalty)
		_, err = transaction.Exec("INSERT INTO borrowing.penalty(description, account_id, amount) VALUES($1, $2 ,$3 )", description, borrowedBook.AccountId, borrowedBook.Penalty )
		if err != nil {
			return err
		}
	}
	return nil
}

func (repo * Borrowing)handleQueue(transaction * sqlx.Tx, bookId string, accessionId string) error{
	queue := model.BorrowingQueue{}
	isWeeded := true
	err := transaction.Get(&isWeeded, "SELECT (case when weeded_at is null then false else true end) as isWeeded FROM catalog.accession where id = $1", accessionId)
	if err != nil {
		return err
	}
	if(isWeeded){
		recordCount := 0
		err := transaction.Get(&recordCount, "SELECT COUNT(1) FROM catalog.accession where book_id = $1 and weeded_at is null", bookId)	
		if err != nil {
			return err
		}
		if(recordCount > 0){
			return nil
		}
		_, err = transaction.Exec("UPDATE borrowing.queue set dequeued_at = now() where book_id = $1", bookId)
		if err != nil {
			return err
		}
		return nil
	}
	err = transaction.Get(&queue, "SELECT id, account_id from borrowing.queue where book_id = $1 and dequeued_at is null ORDER BY created_at LIMIT 1", bookId)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == sql.ErrNoRows{
		return nil
	}
	settings := model.Settings{}

	penaltyOnPastDue :=  settings.Value.DuePenalty.Value
	query := `SELECT value from system.settings limit 1`;
	err = transaction.Get(&settings, query)
	if err!= nil {
		return err
	}
	groupId := uuid.New()
	_, err = transaction.Exec(`INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id,  penalty_on_past_due ) 
	VALUES($1, $2, $3, $4, $5)`, accessionId, groupId.String(), queue.AccountId, status.BorrowStatusPending, penaltyOnPastDue)
	if err != nil {
			return err
	}
	_, err = transaction.Exec("UPDATE borrowing.queue set dequeued_at = now() where id = $1", queue.Id)
	if err != nil {
		return  err
	}
	return nil
}
func (repo * Borrowing) MarkAsReturned(id string, remarks string) error {
	//Mark the book as returned if the book status is checked out. The status id for checked out is 3.
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}

	borrowedBook := model.BorrowedBook{}
	err = repo.db.Get(&borrowedBook, "SELECT id, book, accession_id from borrowed_book_view where id = $1", id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	//if has a penalty, insert the penalty in penalty table
	err = repo.handlePenaltyCreation(id, transaction)
	if err != nil {
		transaction.Rollback()
		return err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
	_, err = transaction.Exec(query, status.BorrowStatusReturned, remarks ,id, status.BorrowStatusCheckedOut)
	if err != nil {
		transaction.Rollback()
		return err
	}
	err = repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return err
	}
    transaction.Commit() 
	return nil
}

func (repo * Borrowing) MarkAsUnreturned(id string, remarks string) error {
	//Mark the book as unreturned if the book status is checked out. The status id for checked out is 3.
	//Mark the book as returned if the book status is checked out. The status id for checked out is 3.
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	borrowedBook := model.BorrowedBook{}

	err = repo.db.Get(&borrowedBook, "SELECT book, accession_id from borrowed_book_view where id = $1", id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	//if has a penalty, insert he penalty in penalty table
	err = repo.handlePenaltyCreation(id, transaction)
	if err != nil {
		transaction.Rollback()
		return err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
	_, err = transaction.Exec(query, status.BorrowStatusUnreturned, remarks ,id, status.BorrowStatusCheckedOut)
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec("UPDATE catalog.accession SET weeded_at = now(), remarks = 'Borrowed and not returned.' where id = $1", borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	err = repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
	if err != nil{
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}

func(repo * Borrowing) MarkAsApproved(id string, remarks string) error {
		//Mark the book as approved if the book status is pending. The status id for pending is 1.
		isEbook := false 
		err := repo.db.Get(&isEbook, "SELECT is_ebook as isEbook from  borrowed_book_all_view where id = $1  LIMIT 1", id)
		if err != nil {
			return err
		}
		if isEbook {
			query := "UPDATE borrowing.borrowed_ebook SET status_id = $1 where id = $2 and status_id = $3"
			_, err = repo.db.Exec(query, status.BorrowStatusApproved, id, status.BorrowStatusPending)
			if err != nil {
				return err
			}
			return nil
		}
		query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
		_, err = repo.db.Exec(query, status.BorrowStatusApproved, remarks ,id, status.BorrowStatusPending)
		if err != nil {
			return err
		}
		return nil
}
func (repo * Borrowing) MarkAsCheckedOut(id string, remarks string, dueDate db.NullableDate) error{
	//Mark the book as checked out if the book status is approved. The status id for approved is 2.

	isEbook := false 
	err := repo.db.Get(&isEbook, "SELECT is_ebook as isEbook from borrowed_book_all_view where id = $1  LIMIT 1", id)
	if err != nil {
		return err
	}
	if isEbook {
		query := "UPDATE borrowing.borrowed_ebook SET status_id = $1, due_date = $2 where id = $3 and (status_id = $4 OR status_id = $5)"
		_, err = repo.db.Exec(query, status.BorrowStatusCheckedOut, dueDate, id, status.BorrowStatusApproved, status.BorrowStatusCheckedOut)
		if err != nil {
			return err
		}
		return nil
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2, due_date = $3 where id = $4 and (status_id = $5 or status_id = $6)"
	_, err = repo.db.Exec(query, status.BorrowStatusCheckedOut, remarks , dueDate, id, status.BorrowStatusApproved, status.BorrowStatusCheckedOut)
	return err 
}
func (repo * Borrowing) MarkAsCancelled(id string, remarks string) error{
	//Mark the book as checked out if the book status is approved,pending or checkedout. The status id for approved is 2, pending is 1 and checked out is 3.
	borrowedBook := model.BorrowedBook{}
	err := repo.db.Get(&borrowedBook, "SELECT book, is_ebook, accession_id from borrowed_book_all_view where id = $1  LIMIT 1", id)
	if err != nil {
		return err
	}
	if borrowedBook.IsEbook {
		query := "UPDATE borrowing.borrowed_ebook SET status_id = $1 where id = $2 and (status_id = $3 or status_id = $4 or status_id = $5 )"
		_, err = repo.db.Exec(query, status.BorrowStatusCancelled, id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
		if err != nil {
			return err
		}
		return nil
	}

	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and (status_id = $4 or status_id = $5 or status_id = $6 ) "
	_, err = transaction.Exec(query, status.BorrowStatusCancelled, remarks , id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
	if err != nil {
		transaction.Rollback()
		return err
	}
	err  = repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
}

func(repo *Borrowing) CancelByIdAndAccountId(id string, accountId string) error {
	//cancel the borrowed book only if it is pending and approved.
	remarks := "Cancelled by user."
	borrowedBook := model.BorrowedBook{}
	
	err := repo.db.Get(&borrowedBook, "SELECT book,accession_id,is_ebook from borrowed_book_all_view where id = $1  LIMIT 1", id)
	if err != nil {
		return err
	}
	if borrowedBook.IsEbook {
		query := "UPDATE borrowing.borrowed_ebook SET status_id = $1 where id = $2 and account_id= $3 and (status_id = $4 or status_id = $5 )"
		_, err = repo.db.Exec(query, status.BorrowStatusCancelled, id, accountId, status.BorrowStatusPending, status.BorrowStatusApproved)
		if err != nil {
			return err
		}
		return nil
	}
	transaction, err := repo.db.Beginx()
    if err != nil {
		transaction.Rollback()
		return err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1 , remarks = $2 where id = $3 and account_id = $4 and (status_id = $5 OR status_id = $6)"
	_, err = transaction.Exec(query, status.BorrowStatusCancelled, remarks, id, accountId, status.BorrowStatusPending, status.BorrowStatusApproved)
	if err != nil {
		transaction.Rollback()
		return err
	}
	err = repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId )
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
}