package model

type Publisher struct {
	Id   int    `json:"id"`
	Name string `json:"name" db:"name"`
}