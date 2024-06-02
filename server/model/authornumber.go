package model

type AuthorNumber struct {
	Id      int    `json:"id" db:"id"`
	Surname string `json:"surname" db:"surname"`
	Number  string    `json:"number" db:"number"`
}
