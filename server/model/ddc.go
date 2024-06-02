package model

type DDC struct {
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Number string `db:"number" json:"number"`
}
