package model

import (
	"database/sql/driver"
	"encoding/json"
	"slim-app/server/app/db"
)

type Book struct {
	Id          string `json:"id" db:"id"`
	Title       string `json:"title" db:"title"`
	Description string `json:"description" db:"description"`
	ISBN        string `json:"isbn" db:"isbn"`
	Copies      int    `json:"copies" db:"copies"`
	Pages       int    `json:"pages" db:"pages"`

	Section    SectionJSON    `json:"section" db:"section"`
	Publisher  PublisherJSON  `json:"publisher" db:"publisher"`
	FundSource FundSourceJSON `json:"fundSource" db:"fund_source"`

	CostPrice     float32         `json:"costPrice" db:"cost_price"`
	Edition       int             `json:"edition" db:"edition"`
	YearPublished int             `json:"yearPublished" db:"year_published"`
	ReceivedAt    db.NullableTime `json:"receivedAt" db:"received_at"`
	DDC           float64         `json:"ddc" db:"ddc"`
	AuthorNumber  string          `json:"authorNumber" db:"author_number"`

	Authors    AuthorsJSON     `json:"authors" db:"authors"`
	Accessions AccessionsJSON  `json:"accessions" db:"accessions"`
	CreatedAt  db.NullableTime `json:"createdAt" db:"created_at"`
}
type BookJSON struct {
	Book
}

func (book *BookJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, book)
		if unmarshalErr != nil {
			*book = BookJSON{
				Book: Book{},
			}
		}
	} else {
		*book = BookJSON{
			Book: Book{},
		}

	}
	return nil

}
func (book BookJSON) Value(value interface{}) (driver.Value, error) {
	return book, nil
}

type Accession struct {
	Id           string   `json:"id"`
	Number       int      `json:"number" db:"number" copier:"Number"`
	CopyNumber   int      `json:"copyNumber" db:"copy_number"`
	BookId       string   `json:"bookId" db:"book_id" copier:"BookId"`
	IsCheckedOut bool     `json:"isCheckedOut" db:"is_checked_out"`
	Book         BookJSON `json:"book" db:"book"`
}

type AccessionsJSON []struct {
	Id         string `json:"id"`
	Number     int    `json:"number" db:"number"`
	CopyNumber int    `json:"copyNumber" db:"copy_number"`
}

func (ba *AccessionsJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(AccessionsJSON, 0)
		}

	} else {
		*ba = make(AccessionsJSON, 0)
	}
	return nil

}

func (ba AccessionsJSON) Value(value interface{}) (driver.Value, error) {
	return ba, nil
}
