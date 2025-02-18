package validator

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type scannerAccountValidator struct {
	db *sqlx.DB
}
func NewScannerAccountValidator(db * sqlx.DB) scannerAccountValidator{
	return scannerAccountValidator{
		db: db,
	}
}
func (v * scannerAccountValidator) ValidateUsernameIfTaken(account * model.ScannerAccount) (  map[string]string, error) {
	
	recordCount := 0
	err := v.db.Get(&recordCount, "SELECT COUNT(1) as recordCount FROM system.scanner_account where UPPER(username) = UPPER($1)", account.Username)
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
func (v * scannerAccountValidator) ValidateUsernameIfTakenOnUpdate(account * model.ScannerAccount) ( map[string]string, error,) {
	recordCount := 0
	err := v.db.Get(&recordCount, "SELECT COUNT(1) as recordCount FROM system.scanner_account where UPPER(username) = UPPER($1) and id != $2",account.Username, account.Id)
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