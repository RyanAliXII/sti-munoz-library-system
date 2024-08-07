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
type UpdateStatusResult struct {
	NextAccountId string  //next account id in queue

}
func (repo * Borrowing)handlePenaltyCreation(id string, transaction * sqlx.Tx) error{
	
	borrowedBook := model.BorrowedBook{}
	err := transaction.Get(&borrowedBook,"SELECT id, account_id, penalty, book, accession_id, due_date, created_at FROM borrowed_book_view where id = $1", id)
	if err != nil {
		return err
	}
	if borrowedBook.Penalty > 0 {
		borrowedDate := fmt.Sprintf("%s %d %d", borrowedBook.CreatedAt.Month(), borrowedBook.CreatedAt.Day(), borrowedBook.CreatedAt.Year())
		description := fmt.Sprintf(`Late return of book, Due date: %s`, borrowedDate)
		_, err = transaction.Exec("INSERT INTO borrowing.penalty(description, account_id, amount, item) VALUES($1, $2 ,$3, $4 )", description, borrowedBook.AccountId, borrowedBook.Penalty, borrowedBook.Book.Title )
		if err != nil {
			return err
		}
	}
	return nil
}

func (repo * Borrowing)handlePenaltyCreationWithAdditionalFee(id string, additionalDesc string, additionalAmount float64, transaction * sqlx.Tx) error{
	
	borrowedBook := model.BorrowedBook{}
	err := transaction.Get(&borrowedBook,"SELECT id, account_id, penalty, book, accession_id, due_date, created_at FROM borrowed_book_view where id = $1", id)
	if err != nil {
		return err
	}
	if borrowedBook.Penalty > 0 || additionalAmount > 0 {
		borrowedDate := fmt.Sprintf("%s %d %d", borrowedBook.CreatedAt.Month(), borrowedBook.CreatedAt.Day(), borrowedBook.CreatedAt.Year())
		description := ""
		if(borrowedBook.Penalty > 0 ){
			description = fmt.Sprintf(`Late return of book + %s, Due date: %s`, additionalDesc, borrowedDate)
		}else{
			description  = 	additionalDesc
		}
		total := borrowedBook.Penalty + additionalAmount
		_, err = transaction.Exec("INSERT INTO borrowing.penalty(description, account_id, amount, item) VALUES($1, $2 ,$3, $4 )", description, borrowedBook.AccountId, total, borrowedBook.Book.Title )
		if err != nil {
			return err
		}
	}
	return nil
}


func (repo * Borrowing)handleQueue(transaction * sqlx.Tx, bookId string, accessionId string) (string, error){
	queue := model.BorrowingQueue{}
	nextAccountId := ""
	isWeeded := true
	err := transaction.Get(&isWeeded, "SELECT (case when weeded_at is null then false else true end) as isWeeded FROM catalog.accession where id = $1", accessionId)
	if err != nil {
		return nextAccountId,err
	}
	if(isWeeded){
		recordCount := 0
		err := transaction.Get(&recordCount, "SELECT COUNT(1) FROM catalog.accession where book_id = $1 and weeded_at is null", bookId)	
		if err != nil {
			return nextAccountId, err
		}
		if(recordCount > 0){
			return nextAccountId, err
		}
		_, err = transaction.Exec("UPDATE borrowing.queue set dequeued_at = now() where book_id = $1", bookId)
		if err != nil {
			return nextAccountId, err
		}
		return nextAccountId, err
	}
	err = transaction.Get(&queue, "SELECT id, account_id from borrowing.queue where book_id = $1 and dequeued_at is null ORDER BY queued_at asc LIMIT 1", bookId)
	if err != nil && err != sql.ErrNoRows {
		return nextAccountId, err
	}
	if err == sql.ErrNoRows{
		return nextAccountId, nil
	}
	settings := model.Settings{}

	penaltyOnPastDue :=  settings.Value.DuePenalty.Value
	query := `SELECT value from system.settings limit 1`;
	err = transaction.Get(&settings, query)
	if err!= nil {
		return nextAccountId, err
	}
	groupId := uuid.New()
	_, err = transaction.Exec(`INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id,  penalty_on_past_due ) 
	VALUES($1, $2, $3, $4, $5)`, accessionId, groupId.String(), queue.AccountId, status.BorrowStatusPending, penaltyOnPastDue)
	if err != nil {
			return nextAccountId, err
	}
	_, err = transaction.Exec("UPDATE borrowing.queue set dequeued_at = now() where id = $1", queue.Id)
	if err != nil {
		return  nextAccountId, err
	}
	bookTitle := ""
	err = transaction.Get(&bookTitle, "SELECT title from catalog.book where id = $1", bookId)
	if err != nil {
		return nextAccountId, err
	}
	nextAccountId = queue.AccountId
	return nextAccountId, err
}
func (repo * Borrowing) MarkAsReturned(id string, remarks string)(UpdateStatusResult, error){
	//Mark the book as returned if the book status is checked out. The status id for checked out is 3.
	result := UpdateStatusResult{}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return result, err
	}

	borrowedBook := model.BorrowedBook{}
	err = repo.db.Get(&borrowedBook, "SELECT id, book, accession_id from borrowed_book_view where id = $1", id)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	//if has a penalty, insert the penalty in penalty table
	err = repo.handlePenaltyCreation(id, transaction)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
	_, err = transaction.Exec(query, status.BorrowStatusReturned, remarks ,id, status.BorrowStatusCheckedOut)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	nextAccountId, err := repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	result.NextAccountId = nextAccountId
    transaction.Commit() 
	return result, nil
}
func (repo * Borrowing) MarkAsReturnedWithAddtionalPenalty(id string, returnedBook model.ReturnBook) (UpdateStatusResult, error) {
	//Mark the book as returned if the book status is checked out. The status id for checked out is 3.
	result := UpdateStatusResult{}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return result, err
	}

	borrowedBook := model.BorrowedBook{}
	err = repo.db.Get(&borrowedBook, "SELECT id, book, accession_id from borrowed_book_view where id = $1", id)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	//if has a penalty, insert the penalty in penalty table
	err = repo.handlePenaltyCreationWithAdditionalFee(id, returnedBook.PenaltyDescription, returnedBook.PenaltyAmount, transaction)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
	_, err = transaction.Exec(query, status.BorrowStatusReturned, returnedBook.Remarks ,id, status.BorrowStatusCheckedOut)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	nextAccountId, err := repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	result.NextAccountId  = nextAccountId
    transaction.Commit() 
	return result, nil
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
	_, err = transaction.Exec("UPDATE catalog.accession SET missing_at = now(), remarks = 'Borrowed and not returned.' where id = $1", borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
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
func (repo * Borrowing) MarkAsCancelled(id string, remarks string) (UpdateStatusResult, error){
	//Mark the book as checked out if the book status is approved,pending or checkedout. The status id for approved is 2, pending is 1 and checked out is 3.
	result := UpdateStatusResult{}
	borrowedBook := model.BorrowedBook{}
	err := repo.db.Get(&borrowedBook, "SELECT book, is_ebook, accession_id from borrowed_book_all_view where id = $1  LIMIT 1", id)
	if err != nil {
		return result, err
	}
	if borrowedBook.IsEbook {
		query := "UPDATE borrowing.borrowed_ebook SET status_id = $1 where id = $2 and (status_id = $3 or status_id = $4 or status_id = $5 )"
		_, err = repo.db.Exec(query, status.BorrowStatusCancelled, id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
		if err != nil {
			return result,err
		}
		return result, nil
	}

	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and (status_id = $4 or status_id = $5 or status_id = $6 ) "
	_, err = transaction.Exec(query, status.BorrowStatusCancelled, remarks , id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	nextAccountId, err  := repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	result.NextAccountId = nextAccountId
	transaction.Commit()
	return result, nil
}

func(repo *Borrowing) CancelByIdAndAccountId(id string, remarks string, accountId string)(UpdateStatusResult, error){
	//cancel the borrowed book only if it is pending and approved.
	result := UpdateStatusResult{}
	borrowedBook := model.BorrowedBook{}
	
	err := repo.db.Get(&borrowedBook, "SELECT book,accession_id,is_ebook from borrowed_book_all_view where id = $1  LIMIT 1", id)
	if err != nil {
		return result, err
	}
	if borrowedBook.IsEbook {
		query := "UPDATE borrowing.borrowed_ebook SET status_id = $1 where id = $2 and account_id= $3 and (status_id = $4 or status_id = $5 )"
		_, err = repo.db.Exec(query, status.BorrowStatusCancelled, id, accountId, status.BorrowStatusPending, status.BorrowStatusApproved)
		if err != nil {
			return result, err
		}
		return result, nil
	}
	transaction, err := repo.db.Beginx()
    if err != nil {
		transaction.Rollback()
		return result, err
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1 , remarks = $2 where id = $3 and account_id = $4 and (status_id = $5 OR status_id = $6)"
	_, err = transaction.Exec(query, status.BorrowStatusCancelled, remarks, id, accountId, status.BorrowStatusPending, status.BorrowStatusApproved)
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	nextAccountId, err := repo.handleQueue(transaction, borrowedBook.Book.Id, borrowedBook.AccessionId )
	if err != nil {
		transaction.Rollback()
		return result, err
	}
	result.NextAccountId = nextAccountId
	transaction.Commit()
	return result, nil
}

func (repo * Borrowing)GetBookStatusBasedOnClient(bookId string, accountId string,)(model.BookStatus, error) {
	status := model.BookStatus{}
	query := `
	SELECT 
	(SELECT exists(
		SELECT 1 from borrowed_book_view as bbv 
		where bbv.book_id = $1 and bbv.account_id =  $2
		AND (bbv.status_id = 1 OR bbv.status_id = 2 OR bbv.status_id = 3) 
		)  
	) as is_already_borrowed,
	(
	  SELECT exists(
		  SELECT 1 from bag_view as bag
		 where book_id = $1 and account_id = $2
	  ) 
	) as is_already_in_bag,
	(
		SELECT exists(
			SELECT 1 from borrowing.queue
		   where queue.book_id = $1 and queue.account_id = $2 and dequeued_at is null
		) 
	) as is_in_queue,
	bool_or((case when bb.id is not null then false else true end))
	as is_available from catalog.accession 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND 
	(status_id = 1 OR status_id = 2 OR status_id = 3)
	where weeded_at is null and accession.book_id = $1
	GROUP BY book_id
	LIMIT 1
	`
	err := repo.db.Get(&status, query, bookId, accountId)
	return status, err
}