package model

type Book struct {
	Id            string  `json:"id" db:"id"`
	Title         string  `json:"title" db:"title"`
	Description   string  `json:"description" db:"description"`
	ISBN          string  `json:"isbn" db:"isbn"`
	Copies        int     `json:"copies" db:"copies"`
	Pages         int     `json:"pages" db:"pages"`
	SectionId     int     `json:"sectionId" db:"section_id"`
	PublisherId   int     `json:"publisherId" db:"publisher_id"`
	FundSourceId  int     `json:"fundSourceId" db:"fund_source_id"`
	CostPrice     float32 `json:"costPrice" db:"cost_price"`
	Edition       int     `json:"edition" db:"edition"`
	YearPublished int     `json:"yearPublished" db:"year_published"`
	ReceivedAt    NullTimeCustom
	DDC           float64 `json:"ddc" db:"ddc"`
	AuthorNumber  string  `json:"authorNumber" db:"author_number"`
	DeletedAt     NullTimeCustom
	WeededAt      NullTimeCustom
	CreatedAt     NullTimeCustom
}
