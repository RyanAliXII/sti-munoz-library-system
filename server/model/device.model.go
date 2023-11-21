package model

type Device struct {
	Id string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Available int `json:"available" db:"available"`
}