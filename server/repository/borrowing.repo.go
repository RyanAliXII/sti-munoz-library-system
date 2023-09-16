package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)








type BorrowingRepository interface {

	BorrowBook([]model.BorrowedBook) error

}
type Borrowing struct{
	db * sqlx.DB

}
func (repo * Borrowing)BorrowBook(borrowedBooks []model.BorrowedBook) error{
	_, err := repo.db.NamedExec("INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id, due_date, penalty_on_past_due ) VALUES(:accession_id, :group_id, :account_id, :status_id, :due_date, :penalty_on_past_due)", borrowedBooks)
	return err

}
func NewBorrowingRepository ()  BorrowingRepository {
	return &Borrowing{
		db: db.Connect(),
	}
}