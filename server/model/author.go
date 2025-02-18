package model

import (
	"database/sql/driver"
	"encoding/json"
)


type Author struct {
	Id    string    `json:"id" db:"id"`
	Name  string `json:"name" db:"name"`
}
type AuthorsJSON []Author

func (instance *AuthorsJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AuthorsJSON{}
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
func (copy AuthorsJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}
