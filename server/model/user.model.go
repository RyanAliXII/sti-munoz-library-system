package model

type UserType struct {
	Id int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}
type UserProgramOrStrand struct {
	Id int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Code string `json:"code" db:"code"`
}