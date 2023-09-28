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

// type PeopleAsAuthorJSON []struct {
// 	PersonAsAuthor
// }

// func (instance *PeopleAsAuthorJSON) Scan(value interface{}) error {
// 	val, valid := value.([]byte)

// 	if valid {
// 		unmarshalErr := json.Unmarshal(val, instance)
// 		if unmarshalErr != nil {
// 			*instance = make(PeopleAsAuthorJSON, 0)
// 		}
// 	} else {
// 		*instance = make(PeopleAsAuthorJSON, 0)
// 	}
// 	return nil

// }
// func (copy PeopleAsAuthorJSON) Value(value interface{}) (driver.Value, error) {
// 	return copy, nil
// }

// type OrgsAsAuthorJSON []struct {
// 	Id   int    `json:"id" db:"id"`
// 	Name string `json:"name" db:"name"`
// }

// func (instance *OrgsAsAuthorJSON) Scan(value interface{}) error {
// 	val, valid := value.([]byte)

// 	if valid {
// 		unmarshalErr := json.Unmarshal(val, instance)
// 		if unmarshalErr != nil {
// 			*instance = make(OrgsAsAuthorJSON, 0)
// 		}
// 	} else {
// 		*instance = make(OrgsAsAuthorJSON, 0)
// 	}
// 	return nil

// }
// func (copy OrgsAsAuthorJSON) Value(value interface{}) (driver.Value, error) {
// 	return copy, nil
// }
