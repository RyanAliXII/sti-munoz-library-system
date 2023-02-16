package model

import (
	"database/sql/driver"
	"encoding/json"
	"slim-app/server/app/db"
)

type BookNew struct {
	Book
	Authors []Author `json:"authors" db:"authors"`
}

type BookUpdate struct {
	Book
	Authors []Author `json:"authors" db:"authors"`
}

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
	Accessions BookAccesions   `json:"accessions" db:"accessions"`
	CreatedAt  db.NullableTime `json:"createdAt" db:"created_at"`
}

type Accession struct {
	Number       int           `json:"number" db:"accession_number" copier:"Number"`
	CopyNumber   int           `json:"copyNumber" db:"copy_number"`
	BookId       string        `json:"bookId" db:"book_id" copier:"BookId"`
	IsCheckedOut bool          `json:"isCheckedOut" db:"is_checked_out"`
	Book         AccessionBook `json:"book" db:"book"`
}

type AccessionBook struct {
	Book
}

func (book *AccessionBook) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, book)
		if unmarshalErr != nil {
			*book = AccessionBook{
				Book: Book{},
			}
		}
	} else {
		*book = AccessionBook{
			Book: Book{},
		}

	}
	return nil

}
func (book AccessionBook) Value(value interface{}) (driver.Value, error) {
	return book, nil
}

type BookAccesions []struct {
	Number     int `json:"number" db:"number"`
	CopyNumber int `json:"copyNumber" db:"copy_number"`
}

func (ba *BookAccesions) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(BookAccesions, 0)
		}

	} else {
		*ba = make(BookAccesions, 0)
	}
	return nil

}

func (ba BookAccesions) Value(value interface{}) (driver.Value, error) {
	return ba, nil
}
