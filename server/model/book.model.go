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
type BookGet struct {
	Book
	CreatedAt  db.NullableTime `json:"created_at" db:"created_at"`
	Authors    BookAuthors     `json:"authors" db:"authors"`
	Accessions BookAccesions   `json:"accessions" db:"accessions"`
}

type Book struct {
	Id            string          `json:"id" db:"id"`
	Title         string          `json:"title" db:"title"`
	Description   string          `json:"description" db:"description"`
	ISBN          string          `json:"isbn" db:"isbn"`
	Copies        int             `json:"copies" db:"copies"`
	Pages         int             `json:"pages" db:"pages"`
	SectionId     int             `json:"sectionId" db:"section_id"`
	Section       string          `json:"section" db:"section"`
	PublisherId   int             `json:"publisherId" db:"publisher_id"`
	Publisher     string          `json:"publisher" db:"publisher"`
	FundSourceId  int             `json:"fundSourceId" db:"fund_source_id"`
	FundSource    string          `json:"fundSource" db:"fund_source"`
	CostPrice     float32         `json:"costPrice" db:"cost_price"`
	Edition       int             `json:"edition" db:"edition"`
	YearPublished int             `json:"yearPublished" db:"year_published"`
	ReceivedAt    db.NullableTime `json:"receivedAt" db:"received_at"`
	DDC           float64         `json:"ddc" db:"ddc"`
	AuthorNumber  string          `json:"authorNumber" db:"author_number"`
}

type Accession struct {
	Number     int             `json:"number" db:"accession_number"`
	CopyNumber int             `json:"copyNumber" db:"copy_number"`
	BookId     string          `json:"bookId" db:"book_id"`
	CreatedAt  db.NullableTime `json:"created_at" db:"created_at"`
	Book
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

type BookAuthors []struct {
	Id         int    `json:"id" db:"id"`
	GivenName  string `json:"givenName" db:"given_name"`
	MiddleName string `json:"middleName" db:"middle_name"`
	Surname    string `json:"surname" db:"surname"`
}

func (ba *BookAuthors) Scan(value interface{}) error {
	val, valid := value.([]byte)

	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(BookAuthors, 0)
		}
	} else {
		*ba = make(BookAuthors, 0)
	}
	return nil

}

func (ba BookAuthors) Value(value interface{}) (driver.Value, error) {

	return ba, nil
}
