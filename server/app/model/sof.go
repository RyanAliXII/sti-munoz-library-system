package model

type SOF struct {
	Id   int    `json:"id"`
	Name string `db:"name" json:"name"`
}
