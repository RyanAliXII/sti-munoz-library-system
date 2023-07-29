package model

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type Account struct {
	Id          string          `json:"id" db:"id" csv:"id" validate:"required"`
	DisplayName string          `json:"displayName" db:"display_name" csv:"displayName"`
	GivenName   string          `json:"givenName" db:"given_name" csv:"givenName"`
	Surname     string          `json:"surname" db:"surname" csv:"surname"`
	Email       string          `json:"email" db:"email" csv:"mail" validate:"required"`
	AccountMetadata AccountMetadata `json:"metaData" db:"meta_data"`
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


type AccountMetadata struct {
	TotalPenalty float64 `json:"totalPenalty"`
	WalkInCheckedOutBooks int `json:"walkInCheckedOutBooks"`
	WalkInReturnedBooks int `json:"walkInReturnedBooks"`
	OnlinePendingBooks int `json:"onlinePendingBooks"`
	OnlineApprovedBooks int `json:"onlineApprovedBooks"`
	OnlineCheckedOutBooks int `json:"onlineCheckedOutBooks"`
	OnlineReturnedBooks int `json:"onlineReturnedBooks"`
	OnlineCancelledBooks int `json:"onlineCancelledBooks"`
}
func (meta *AccountMetadata) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AccountMetadata{
		TotalPenalty: 0,
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, meta)
		if unmarshalErr != nil {
			*meta = INITIAL_DATA_ON_ERROR
		}
	} else {
		*meta = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (meta AccountMetadata) Value(value interface{}) (driver.Value, error) {
	return meta, nil
}
