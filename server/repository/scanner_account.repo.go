package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type ScannerAccountRepository interface {
	NewAccount(model.ScannerAccount) error
}

type ScannerAccount struct {
	db * sqlx.DB
}
func(repo * ScannerAccount) NewAccount(account model.ScannerAccount) error {
	fmt.Println(account)
	fmt.Println(account.Username)
	_, err := repo.db.Exec("INSERT INTO system.scanner_account(username, password, description) VALUES($1, $2, $3)", account.Username, account.Password, account.Description)
	return err	
}
func NewScannerAccountRepository()ScannerAccountRepository {
	return &ScannerAccount {
		db: db.Connect(),
	}
}
