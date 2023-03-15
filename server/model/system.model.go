package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type Role struct {
	Id          int         `json:"id" db:"id"`
	Name        string      `json:"name" db:"name"`
	Permissions Permissions `json:"permissions" db:"permissions"`
}


type RoleJSON struct{
	Role
}
func (instance *RoleJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := RoleJSON{
		Role: Role{},
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
func (copy RoleJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}



type Permissions map[string][]string

func (instance Permissions) Value() (driver.Value, error) {
	return json.Marshal(instance)
}

func (instance *Permissions) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &instance)
}
