package model

type UserType struct {
	Id int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	HasProgram bool `json:"hasProgram" db:"has_program"`
}
type UserProgramOrStrand struct {
	Id int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Code string `json:"code" db:"code"`
	UserTypeId int `json:"userTypeId" db:"user_type_id"`
}