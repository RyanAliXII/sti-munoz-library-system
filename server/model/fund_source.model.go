package model

type FundSource struct {
	Id   int    `json:"id"`
	Name string `db:"name" json:"name"`
}
