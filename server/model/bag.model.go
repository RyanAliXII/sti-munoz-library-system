package model


type BagItem struct {
	Id string `json:"id" db:"id"`
	BookId string `json:"bookId" db:"book_id"`
	IsEbook bool `json:"isEbook" db:"is_ebook"`
	AccessionId  string `json:"accessionId" db:"accession_id"`
	AccountId string `json:"accountId" db:"account_id"`
	AccessionNumber int `json:"accessionNumber" db:"accession_number"`
	CopyNumber int `json:"copyNumber" db:"copy_number"`
	Book BookJSON `json:"book" db:"book"`
	IsAvailable bool `json:"isAvailable" db:"is_available"`
	IsChecked bool `json:"isChecked" db:"is_checked"`
}
