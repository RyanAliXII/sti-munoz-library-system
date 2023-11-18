package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
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

func(repo *Borrowing) UpdateRemarks(id string, remarks string) error {
	query := "UPDATE borrowing.borrowed_book SET  remarks = $1 where id = $2"
	_, err := repo.db.Exec(query, remarks , id)
	return err 	
}



func NewBorrowingRepository ()  BorrowingRepository {
	return &Borrowing{
		db: db.Connect(),
	}
}