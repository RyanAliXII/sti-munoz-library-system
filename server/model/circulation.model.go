package model

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type BorrowingTransaction struct {
	Id             string          `json:"id" db:"id"`
	Client         AccountJSON     `json:"client" db:"client"`
	BorrowedCopies BorrowedCopies  `json:"borrowedCopies" db:"borrowed_copies"`
	DueDate        db.NullableTime `json:"dueDate" db:"due_date"`
	ReturnedAt     db.NullableTime `json:"returnedAt" db:"returned_at"`
	IsReturned     bool            `json:"isReturned" db:"is_returned"`
	Remarks        string          `json:"remarks" db:"remarks"`
	CreatedAt      db.NullableTime `json:"createdAt" db:"created_at"`
}

// the accession of borrowed book
type BorrowedCopies []struct {
	Number     int             `json:"number" db:"number"`
	BookId     string          `json:"bookId" db:"book_id"`
	CopyNumber int             `json:"copyNumber" db:"copy_number"`
	IsReturned bool            `json:"isReturned" db:"is_returned"`
	ReturnedAt db.NullableTime `json:"returnedAt"`
	Book       BookJSON        `json:"book"`
}

func (copies *BorrowedCopies) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, copies)
		if unmarshalErr != nil {
			*copies = make(BorrowedCopies, 0)
		}

	} else {
		*copies = make(BorrowedCopies, 0)
	}
	return nil

}

func (copies BorrowedCopies) Value(value interface{}) (driver.Value, error) {
	return copies, nil
}
