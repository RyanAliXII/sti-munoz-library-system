package model

import "github.com/jmoiron/sqlx/types"

type Book struct {
	Id            string  `json:"id" db:"id"`
	Title         string  `json:"title" db:"title"`
	Description   string  `json:"description" db:"description"`
	ISBN          string  `json:"isbn" db:"isbn"`
	Copies        int     `json:"copies" db:"copies"`
	Pages         int     `json:"pages" db:"pages"`
	SectionId     int     `json:"sectionId" db:"section_id"`
	Section       string  `json:"section" db:"section"`
	PublisherId   int     `json:"publisherId" db:"publisher_id"`
	Publisher     string  `json:"publisher" db:"publisher"`
	FundSourceId  int     `json:"fundSourceId" db:"fund_source_id"`
	FundSource    string  `json:"fundSource" db:"fundSource"`
	CostPrice     float32 `json:"costPrice" db:"cost_price"`
	Edition       int     `json:"edition" db:"edition"`
	YearPublished int     `json:"yearPublished" db:"year_published"`
	ReceivedAt    NullableTime
	DDC           float64 `json:"ddc" db:"ddc"`
	AuthorNumber  string  `json:"authorNumber" db:"author_number"`
	DeletedAt     NullableTime
	WeededAt      NullableTime
	CreatedAt     NullableTime
	Authors       []Author `json:"authors" db:"authors"`
	Accessions    []Accession
}

type BookGet struct {
	Id            string  `json:"id" db:"id"`
	Title         string  `json:"title" db:"title"`
	Description   string  `json:"description" db:"description"`
	ISBN          string  `json:"isbn" db:"isbn"`
	Copies        int     `json:"copies" db:"copies"`
	Pages         int     `json:"pages" db:"pages"`
	SectionId     int     `json:"sectionId" db:"section_id"`
	Section       string  `json:"section" db:"section"`
	PublisherId   int     `json:"publisherId" db:"publisher_id"`
	Publisher     string  `json:"publisher" db:"publisher"`
	FundSourceId  int     `json:"fundSourceId" db:"fund_source_id"`
	FundSource    string  `json:"fundSource" db:"fundSource"`
	CostPrice     float32 `json:"costPrice" db:"cost_price"`
	Edition       int     `json:"edition" db:"edition"`
	YearPublished int     `json:"yearPublished" db:"year_published"`
	ReceivedAt    NullableTime
	DDC           float64 `json:"ddc" db:"ddc"`
	AuthorNumber  string  `json:"authorNumber" db:"author_number"`
	DeletedAt     NullableTime
	WeededAt      NullableTime
	CreatedAt     NullableTime
	Authors       types.JSONText `json:"authors" db:"authors"`
	Accessions    []Accession
}

type Accession struct {
	BookId     string `json:"bookId"`
	CopyNumber int    `json:"copyNumber"`
}
