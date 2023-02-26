package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Author struct {
	Id         int    `json:"id" db:"id"`
	GivenName  string `json:"givenName" db:"given_name"`
	MiddleName string `json:"middleName" db:"middle_name"`
	Surname    string `json:"surname" db:"surname"`
}

type AuthorsJSON []struct {
	Id         int    `json:"id" db:"id"`
	GivenName  string `json:"givenName" db:"given_name"`
	MiddleName string `json:"middleName" db:"middle_name"`
	Surname    string `json:"surname" db:"surname"`
}
type Organization struct {
	Id   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

func (ba *AuthorsJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)

	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(AuthorsJSON, 0)
		}
	} else {
		*ba = make(AuthorsJSON, 0)
	}
	return nil

}

func (ba AuthorsJSON) Value(value interface{}) (driver.Value, error) {
	return ba, nil
}
