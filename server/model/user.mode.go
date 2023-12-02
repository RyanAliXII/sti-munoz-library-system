package model


type UserType struct {
	Id int `json:"id" db:"name"`
	Name string `json:"name" db:"name"`
}