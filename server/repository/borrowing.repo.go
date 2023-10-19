package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type BorrowingRepository interface {

	BorrowBook(borrowedBooks []model.BorrowedBook, borrowedEbooks []model.BorrowedEBook) error
	GetBorrowingRequests()([]model.BorrowingRequest, error)
	MarkAsReturned(id string, remarks string) error
	MarkAsUnreturned(id string, remarks string) error 
	MarkAsApproved(id string, remarks string) error 
	MarkAsCheckedOut(id string, remarks string, dueDate db.NullableDate) error
 	GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error)
	MarkAsCancelled(id string, remarks string) error
	GetBorrowedEBookByIdAndStatus (id string, status int)(model.BorrowedBook, error)
	UpdateRemarks(id string, remarks string) error 
	CancelByIdAndAccountId(id string, accountId string) error
}
type Borrowing struct{
	db * sqlx.DB

}
func (repo * Borrowing)BorrowBook(borrowedBooks []model.BorrowedBook, borrowedEbooks []model.BorrowedEBook) error{
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}

	if(len(borrowedBooks) > 0){
		_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id, due_date, penalty_on_past_due ) VALUES(:accession_id, :group_id, :account_id, :status_id, :due_date, :penalty_on_past_due)", borrowedBooks)
		if err != nil {
			transaction.Rollback()
			return err
		}
	}
	if(len(borrowedEbooks) == 0) {
		transaction.Commit()
		return nil
	} 
	_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_ebook(book_id, group_id, account_id, status_id, due_date ) VALUES(:book_id, :group_id, :account_id, :status_id, :due_date)", borrowedEbooks)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}


func (repo * Borrowing)GetBorrowingRequests()([]model.BorrowingRequest, error){
	requests := make([]model.BorrowingRequest, 0) 
	query := `SELECT group_id as id, account_id,client, SUM(penalty) as total_penalty, 
	COUNT(1) filter (where status_id = 1)  as total_pending, 
	COUNT(1) filter(where status_id = 2) as total_approved, 
	COUNT(1) filter (where status_id = 3) as total_checked_out, 
	COUNT(1) filter(where status_id = 4) as total_returned,
	COUNT(1) filter(where status_id = 5) as total_cancelled,
	COUNT(1) filter (where status_id = 6) as total_unreturned,
	MAX(bbv.created_at)  as created_at
	FROM borrowed_book_all_view as bbv GROUP BY group_id, account_id, client ORDER BY created_at desc
	`
	err := repo.db.Select(&requests, query)
	return requests, err
}

func (repo * Borrowing)GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_all_view where group_id = $1`
	err := repo.db.Select(&borrowedBooks, query, groupId)
	return borrowedBooks, err
}
func (repo * Borrowing) GetBorrowedEBookByIdAndStatus (id string, status int)(model.BorrowedBook, error) {
	borrowedBook := model.BorrowedBook{}
	err := repo.db.Get(&borrowedBook, "SELECT * FROM borrowed_book_all_view WHERE id = $1 and is_ebook = true and status_id = $2", id, status)
	if err != nil {
		return borrowedBook, err
	}
	return borrowedBook,nil
}

func (repo * Borrowing)GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_all_view where account_id = $1 and status_id != 6 order by created_at desc`
	err := repo.db.Select(&borrowedBooks, query, accountId)
	return borrowedBooks, err
}
func (repo * Borrowing)GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_all_view where account_id = $1 and status_id = $2 order by created_at desc`
	err := repo.db.Select(&borrowedBooks, query, accountId, statusId)
	return borrowedBooks, err
}
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
func (repo * Borrowing) MarkAsReturned(id string, remarks string) error {
	//Mark the book as returned if the book status is checked out. The status id for checked out is 3.
	transaction, err := repo.db.Beginx()
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
	_, err = transaction.Exec(query, status.BorrowStatusReturned, remarks ,id, status.BorrowStatusCheckedOut)
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

	err = repo.db.Get(&borrowedBook, "SELECT accession_id from borrowed_book_view where id = $1", id)
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
	isEbook := false 
	err := repo.db.Get(&isEbook, "SELECT is_ebook as isEbook from borrowed_book_all_view where id = $1  LIMIT 1", id)
	if err != nil {
		return err
	}
	if isEbook {
		query := "UPDATE borrowing.borrowed_ebook SET status_id = $1 where id = $2 and (status_id = $3 or status_id = $4 or status_id = $5 )"
		_, err = repo.db.Exec(query, status.BorrowStatusCancelled, id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
		if err != nil {
			return err
		}
		return nil
	}
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and (status_id = $4 or status_id = $5 or status_id = $6 ) "
	_, err = repo.db.Exec(query, status.BorrowStatusCancelled, remarks , id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
	return err 
}

func(repo *Borrowing) UpdateRemarks(id string, remarks string) error {
	query := "UPDATE borrowing.borrowed_book SET  remarks = $1 where id = $2"
	_, err := repo.db.Exec(query, remarks , id)
	return err 	
}


func(repo *Borrowing) CancelByIdAndAccountId(id string, accountId string) error {
	//cancel the borrowed book only if it is pending and approved.
	remarks := "Cancelled by user."
	query := "UPDATE borrowing.borrowed_book SET status_id = $1 , remarks = $2 where account_id = $3 and (status_id = $4 OR status_id = $5)"
	_, err := repo.db.Exec(query,id, accountId, remarks, status.BorrowStatusPending, status.BorrowStatusApproved)
	return err 	
}


func NewBorrowingRepository ()  BorrowingRepository {
	return &Borrowing{
		db: db.Connect(),
	}
}