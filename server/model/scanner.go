package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
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
