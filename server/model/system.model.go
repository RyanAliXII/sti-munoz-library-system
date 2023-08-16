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

type Permission struct {
	Id int `json:"id"`
	Name string `json:"name"`
	Value string `json:"value" `
	Description string `json:"description"`
}
type Permissions []Permission


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
