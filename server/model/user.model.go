package model

import (
	"database/sql/driver"
	"encoding/json"
)

type UserType struct {
	Id int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	HasProgram bool `json:"hasProgram" db:"has_program"`
	MaxAllowedBorrowedBooks int `json:"maxAllowedBorrowedBooks" db:"max_allowed_borrowed_books"`
}
type UserProgramOrStrand struct {
	Id int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Code string `json:"code" db:"code"`
	UserTypeId int `json:"userTypeId" db:"user_type_id"`
	UserType UserTypeJSON  `json:"userType" db:"user_type"`
}
type UserTypeJSON struct {
	UserType
}
func (instance *UserTypeJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := UserTypeJSON{
		UserType: UserType{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = INITIAL_DATA_ON_ERROR
		}
	} else {
		*instance = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (copy  UserTypeJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}


type UserProgramOrStrandJSON struct {
	UserProgramOrStrand
}
func (instance *UserProgramOrStrandJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := UserProgramOrStrandJSON{
		UserProgramOrStrand: UserProgramOrStrand{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = INITIAL_DATA_ON_ERROR
		}
	} else {
		*instance = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (copy  UserProgramOrStrand) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}