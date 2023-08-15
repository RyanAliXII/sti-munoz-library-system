package repository

type Filter struct {
	Offset   int
	Limit    int
	Keyword  string
	Page int
}


type Metadata struct{
	Pages int `json:"pages" db:"pages"`
	Records int `json:"records" db:"records"`
}
