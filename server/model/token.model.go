package model

type Token struct {
	Id string `json:"id" db:"id"`
	Value string `json:"value" db:"token"`
}