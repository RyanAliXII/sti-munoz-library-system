package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
)


type ScannerAccount struct {
	Id string `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Password string `json:"password,omitempty" db:"password"`
	Description string `json:"description" db:"description"`
}
func (m ScannerAccount) ToBytes()([]byte, error){
	m.Password = ""
	b, err := json.Marshal(m)
	return b, err
}
func (m * ScannerAccount) Bind(value any) error{
	bytes, isNotBytes := value.([]byte)
    if(!isNotBytes){
		return fmt.Errorf("not bytes")
	}
	err := json.Unmarshal(bytes, &m)
	return err
}
func (m * ScannerAccount) ValidateUsernameIfTaken() ( map[string]string, error,) {
	db := postgresdb.GetOrCreateInstance()
	recordCount := 0
	err := db.Get(&recordCount, "SELECT COUNT(1) as recordCount FROM system.scanner_account where UPPER(username) = UPPER($1)", m.Username)
	if err != nil {
		return map[string]string{}, err
	}
	if recordCount > 0 {
		return map[string]string{
			"username": "Username is already taken.",
		},nil
	}
	return map[string]string{}, nil
}
func (m * ScannerAccount) ValidateUsernameIfTakenOnUpdate() ( map[string]string, error,) {
	db := postgresdb.GetOrCreateInstance()
	recordCount := 0
	err := db.Get(&recordCount, "SELECT COUNT(1) as recordCount FROM system.scanner_account where UPPER(username) = UPPER($1) and id != $2", m.Username, m.Id)
	if err != nil {
		return map[string]string{}, err
	}
	if recordCount > 0 {
		return map[string]string{
			"username": "Username is already taken.",
		},nil
	}
	return map[string]string{}, nil
}

type ScannerAccountJSON struct {
	ScannerAccount
}
func (account *ScannerAccountJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := ScannerAccountJSON{
		ScannerAccount: ScannerAccount{},
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
func (account ScannerAccountJSON) Value(value interface{}) (driver.Value, error) {
	return account, nil
}
