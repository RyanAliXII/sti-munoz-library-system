package book

type BookBody struct {
	Id            string  `json:"id" db:"id"`
	Title         string  `json:"title" db:"title" binding:"required,min=1,max=150"`
	Description   string  `json:"description" db:"description"`
	ISBN          string  `json:"isbn" db:"isbn"  binding:"required,min=1,max=150,isbn"`
	Copies        int     `json:"copies" db:"copies" binding:"required,gte=1"`
	Pages         int     `json:"pages" db:"pages"  binding:"required,gte=1"`
	SectionId     int     `json:"sectionId" db:"section_id" binding:"required,gte=1"`
	PublisherId   int     `json:"publisherId" db:"publisher_id" binding:"required,gte=1"`
	FundSourceId  int     `json:"fundSourceId" db:"fund_source_id" binding:"required,gte=0"`
	CostPrice     float32 `json:"costPrice" db:"cost_price" binding:"gte=0"`
	Edition       int     `json:"edition" db:"edition"`
	YearPublished int     `json:"yearPublished" db:"year_published" binding:"required"`
	ReceivedAt    string  `json:"receivedAt" db:"received_at" binding:"required"`
	DDC           float64 `json:"ddc" db:"ddc" binding:"gte=0,lt=1000"`
	AuthorNumber  string  `json:"authorNumber" db:"author_number" binding:"required,min=1,max=50"`
}
