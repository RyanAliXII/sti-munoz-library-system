package model

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type Account struct {
	Id          string          `json:"id" db:"id" csv:"id"`
	DisplayName string          `json:"displayName" db:"display_name" csv:"displayName"`
	GivenName   string          `json:"givenName" db:"given_name" csv:"givenName"`
	Surname     string          `json:"surname" db:"surname" csv:"surname"`
	Email       string          `json:"email" db:"email" csv:"mail"`
	SearchRank  float64         `json:"-" db:"search_rank"`
	CreatedAt   db.NullableTime `json:"-" db:"created_at"`
	UpdatedAt   db.NullableTime `json:"-" db:"updated_at"`
}

type AccountJSON struct {
	Account
}

type AccountRoles []struct {
	Account AccountJSON `json:"account" db:"account"`
	Role    RoleJSON    `json:"role" db:"role"`
}
func (account *AccountJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AccountJSON{
		Account: Account{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, account)
		if unmarshalErr != nil {
			*account = INITIAL_DATA_ON_ERROR
		}
	} else {
		*account = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (account AccountJSON) Value(value interface{}) (driver.Value, error) {
	return account, nil
}
