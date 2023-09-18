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
 	GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error)

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
	query := `SELECT group_id as id, account_id, json_build_object('id',account.id, 'displayName', 
	display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client, MAX(borrowed_book.created_at) as created_at FROM borrowing.borrowed_book
	INNER JOIN system.account on account_id = account.id
	GROUP BY account_id, group_id, account.id`
	err := repo.db.Select(&requests, query)
	return requests, err
}

func (repo * Borrowing)GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_view where group_id = $1`
	err := repo.db.Select(&borrowedBooks, query, groupId)
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
func NewBorrowingRepository ()  BorrowingRepository {
	return &Borrowing{
		db: db.Connect(),
	}
}