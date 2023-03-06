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

type Permissions map[string][]string

func (instance Permissions) Value() (driver.Value, error) {
	return json.Marshal(instance)
}

type AccountRoles []struct {
	Account Account `json:"account"`
	Role    Role    `json:"role"`
}

func (instance *Permissions) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &instance)
}
