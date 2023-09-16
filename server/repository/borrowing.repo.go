package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)








type BorrowingRepository interface {



}
type Borrowing struct{
	db * sqlx.DB

}
func (repo * Borrowing)NewAsCheckedOut(borrowedBook model.BorrowedBook){
	
}
func NewBorrowingRepository ()  BorrowingRepository {
	return Borrowing{
		db: db.Connect(),
	}
}