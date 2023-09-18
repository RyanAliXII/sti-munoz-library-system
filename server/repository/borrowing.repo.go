package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)
type BorrowingRepository interface {

	BorrowBook([]model.BorrowedBook) error
	GetBorrowingRequests()([]model.BorrowingRequest, error)
	MarkAsReturned(id string, remarks string) error
	MarkAsUnreturned(id string, remarks string) error 
	MarkAsApproved(id string, remarks string) error 
	MarkAsCheckedOut(id string, remarks string, dueDate db.NullableDate) error
 	GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error)
	MarkAsCancelled(id string, remarks string) error

}
type Borrowing struct{
	db * sqlx.DB

}
func (repo * Borrowing)BorrowBook(borrowedBooks []model.BorrowedBook) error{
	_, err := repo.db.NamedExec("INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id, due_date, penalty_on_past_due ) VALUES(:accession_id, :group_id, :account_id, :status_id, :due_date, :penalty_on_past_due)", borrowedBooks)
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
	FROM borrowed_book_view as bbv GROUP BY group_id, account_id, client ORDER BY created_at desc
	`
	err := repo.db.Select(&requests, query)
	return requests, err
}

func (repo * Borrowing)GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_view where group_id = $1`
	err := repo.db.Select(&borrowedBooks, query, groupId)
	return borrowedBooks, err
}
func (repo * Borrowing)GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_view where account_id = $1`
	err := repo.db.Select(&borrowedBooks, query, accountId)
	return borrowedBooks, err
}
func (repo * Borrowing)GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_view where account_id = $1 and status_id = $2`
	err := repo.db.Select(&borrowedBooks, query, accountId, statusId)
	return borrowedBooks, err
}
func (repo * Borrowing) MarkAsReturned(id string, remarks string) error {
	//Mark the book as returned if the book status is checked out. The status id for checked out is 3.
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
	_, err := repo.db.Exec(query, status.BorrowStatusReturned, remarks ,id, status.BorrowStatusCheckedOut)
	return err
}
func (repo * Borrowing) MarkAsUnreturned(id string, remarks string) error {
	//Mark the book as unreturned if the book status is checked out. The status id for checked out is 3.
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
	_, err := repo.db.Exec(query, status.BorrowStatusUnreturned, remarks ,id, status.BorrowStatusCheckedOut)
	return err
}
func(repo * Borrowing) MarkAsApproved(id string, remarks string) error {
		//Mark the book as approved if the book status is pending. The status id for pending is 1.
		query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and status_id = $4"
		_, err := repo.db.Exec(query, status.BorrowStatusApproved, remarks ,id, status.BorrowStatusPending)
		return err
}
func (repo * Borrowing) MarkAsCheckedOut(id string, remarks string, dueDate db.NullableDate) error{
	//Mark the book as checked out if the book status is approved. The status id for approved is 2.
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2, due_date = $3 where id = $4 and status_id = $5"
	_, err := repo.db.Exec(query, status.BorrowStatusCheckedOut, remarks , dueDate, id, status.BorrowStatusApproved)
	return err 
}
func (repo * Borrowing) MarkAsCancelled(id string, remarks string) error{
	//Mark the book as checked out if the book status is approved,pending or checkedout. The status id for approved is 2, pending is 1 and checked out is 3.
	query := "UPDATE borrowing.borrowed_book SET status_id = $1, remarks = $2 where id = $3 and (status_id = $4 or status_id = $5 or status_id = $6 ) "
	_, err := repo.db.Exec(query, status.BorrowStatusCancelled, remarks , id, status.BorrowStatusApproved, status.BorrowStatusPending, status.BorrowStatusCheckedOut)
	return err 
}
func NewBorrowingRepository ()  BorrowingRepository {
	return &Borrowing{
		db: db.Connect(),
	}
}