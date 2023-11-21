package model

type Device struct {
	Id string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Quantity int `json:"quantity" db:"quantity"`
}