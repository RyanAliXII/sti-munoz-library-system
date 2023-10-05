package repository



type Metadata struct{
	Pages int `json:"pages" db:"pages"`
	Records int `json:"records" db:"records"`
}
