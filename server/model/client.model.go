package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Account struct {
	Id          string  `json:"id" db:"id"`
	DisplayName string  `json:"displayName" db:"display_name"`
	GivenName   string  `json:"givenName" db:"given_name"`
	Surname     string  `json:"surname" db:"surname"`
	Email       string  `json:"email" db:"email"`
	SearchRank  float64 `json:"-" db:"search_rank"`
}

type AccountJSON struct {
	Account
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
