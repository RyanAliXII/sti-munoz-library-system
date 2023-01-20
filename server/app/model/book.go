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
}

type BookGet struct {
	Id            string         `json:"id" db:"id"`
	Title         string         `json:"title" db:"title"`
	Description   string         `json:"description" db:"description"`
	ISBN          string         `json:"isbn" db:"isbn"`
	Copies        int            `json:"copies" db:"copies"`
	Pages         int            `json:"pages" db:"pages"`
	SectionId     int            `json:"sectionId" db:"section_id"`
	Section       string         `json:"section" db:"section"`
	PublisherId   int            `json:"publisherId" db:"publisher_id"`
	Publisher     string         `json:"publisher" db:"publisher"`
	FundSourceId  int            `json:"fundSourceId" db:"fund_source_id"`
	FundSource    string         `json:"fundSource" db:"fund_source"`
	CostPrice     float64        `json:"costPrice" db:"cost_price"`
	Edition       int            `json:"edition" db:"edition"`
	YearPublished int            `json:"yearPublished" db:"year_published"`
	ReceivedAt    NullableTime   `json:"receivedAt" db:"received_at"`
	DDC           float64        `json:"ddc" db:"ddc"`
	AuthorNumber  string         `json:"authorNumber" db:"author_number"`
	DeletedAt     NullableTime   `json:"_"`
	WeededAt      NullableTime   `json:"_"`
	CreatedAt     NullableTime   `json:"createdAt" db:"created_at"`
	Authors       types.JSONText `json:"authors" db:"authors"`
	Accessions    types.JSONText `json:"accessions" db:"accessions"`
}

type BookT struct {
	Id            string         `json:"id" db:"book_id"`
	Title         string         `json:"title" db:"title"`
	Description   string         `json:"description" db:"description"`
	ISBN          string         `json:"isbn" db:"isbn"`
	Copies        int            `json:"copies" db:"copies"`
	Pages         int            `json:"pages" db:"pages"`
	SectionId     int            `json:"sectionId" db:"section_id"`
	Section       string         `json:"section" db:"section"`
	PublisherId   int            `json:"publisherId" db:"publisher_id"`
	Publisher     string         `json:"publisher" db:"publisher"`
	FundSourceId  int            `json:"fundSourceId" db:"fund_source_id"`
	FundSource    string         `json:"fundSource" db:"fund_source"`
	CostPrice     float64        `json:"costPrice" db:"cost_price"`
	Edition       int            `json:"edition" db:"edition"`
	YearPublished int            `json:"yearPublished" db:"year_published"`
	ReceivedAt    NullableTime   `json:"receivedAt" db:"received_at"`
	DDC           float64        `json:"ddc" db:"ddc"`
	AuthorNumber  string         `json:"authorNumber" db:"author_number"`
	DeletedAt     NullableTime   `json:"_"`
	WeededAt      NullableTime   `json:"_"`
	CreatedAt     NullableTime   `json:"createdAt" db:"created_at"`
	Authors       types.JSONText `json:"authors" db:"authors"`
	Accessions    types.JSONText `json:"accessions" db:"accessions"`
}

type Accession struct {
	Number     string `json:"id" db:"accession_number"`
	CopyNumber int    `json:"copyNumber"`
	BookT
}
