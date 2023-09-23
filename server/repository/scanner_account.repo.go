package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type ScannerAccountRepository interface {
	NewAccount(model.ScannerAccount) error
	GetAccounts() ([]model.ScannerAccount, error)
}

type ScannerAccount struct {
	db * sqlx.DB
}
func(repo * ScannerAccount) NewAccount(account model.ScannerAccount) error {
	_, err := repo.db.Exec("INSERT INTO system.scanner_account(username, password, description) VALUES($1, $2, $3)", account.Username, account.Password, account.Description)
	return err	
}
func (repo *ScannerAccount)GetAccounts() ([]model.ScannerAccount, error){
	accounts := make([]model.ScannerAccount, 0)
	err := repo.db.Select(&accounts, "SELECT id, username, description from system.scanner_account")
	return accounts, err
}
func NewScannerAccountRepository()ScannerAccountRepository {
	return &ScannerAccount {
		db: db.Connect(),
	}
}
