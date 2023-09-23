package model

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)


type ScannerAccount struct {
	Id string `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Password string `json:"password,omitempty" db:"password"`
	Description string `json:"description" db:"description"`
}
func (m * ScannerAccount) ValidateUsernameIfTaken() ( map[string]string, error,) {
	db := db.Connect()
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
	db := db.Connect()
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