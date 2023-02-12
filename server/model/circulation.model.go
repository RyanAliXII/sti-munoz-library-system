package model

import (
	"database/sql/driver"
	"encoding/json"
	"slim-app/server/app/db"
)

type BorrowingTransaction struct {
	Id                 string             `json:"id" db:"id"`
	AccountDisplayName string             `json:"accountDisplayName" db:"display_name"`
	AccountId          string             `json:"accountId" db:"account_id"`
	AccountEmail       string             `json:"accountEmail" db:"email"`
	BorrowedAccessions BorrowedAccessions `json:"borrowedAccessions" db:"borrowed_accessions"`
	DueDate            db.NullableTime    `json:"dueDate" db:"due_date"`
	ReturnedAt         db.NullableTime    `json:"returnedAt" db:"returned_at"`
	Remarks            string             `json:"remarks" db:"remarks"`
	CreatedAt          db.NullableTime    `json:"createdAt" db:"created_at"`
}

// the accession of borrowed book
type BorrowedAccessions []struct {
	Number     int    `json:"number" db:"number"`
	Title      string `json:"title" db:"book_title"`
	BookId     string `json:"bookId" db:"book_id"`
	CopyNumber int    `json:"copyNumber" db:"copy_number"`
}

func (ba *BorrowedAccessions) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(BorrowedAccessions, 0)
		}

	} else {
		*ba = make(BorrowedAccessions, 0)
	}
	return nil

}

func (ba BorrowedAccessions) Value(value interface{}) (driver.Value, error) {
	return ba, nil
}
