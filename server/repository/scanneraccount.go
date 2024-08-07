package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type ScannerAccountRepository interface {
	NewAccount(model.ScannerAccount) error
	GetAccounts() ([]model.ScannerAccount, error)
	UpdateAccount(account model.ScannerAccount) error
	UpdateAccountWithPassword(account model.ScannerAccount) error 
	DeleteAccountById(id string) error
	GetAccountByUsername(username string)(model.ScannerAccount, error)
}

type ScannerAccount struct {
	db * sqlx.DB
}
func(repo * ScannerAccount) NewAccount(account model.ScannerAccount) error {
	_, err := repo.db.Exec("INSERT INTO system.scanner_account(username, password, description) VALUES($1, $2, $3)", account.Username, account.Password, account.Description)
	return err	
}
func(repo * ScannerAccount)GetAccountByUsername(username string)(model.ScannerAccount, error){
	account := model.ScannerAccount{}
	err := repo.db.Get(&account, "SELECT id,username,password,description FROM system.scanner_account WHERE username = $1 and deleted_at is null", username)
	return account, err
}
func (repo *ScannerAccount)GetAccounts() ([]model.ScannerAccount, error){
	accounts := make([]model.ScannerAccount, 0)
	err := repo.db.Select(&accounts, "SELECT id, username, description from system.scanner_account where deleted_at IS NULl")
	return accounts, err
}
func(repo * ScannerAccount) UpdateAccount(account model.ScannerAccount) error {
	_, err := repo.db.Exec("Update system.scanner_account set username = $1, description = $2 where id = $3", account.Username,account.Description, account.Id)
	return err	
}
func(repo * ScannerAccount) UpdateAccountWithPassword(account model.ScannerAccount) error {
	_, err := repo.db.Exec("Update system.scanner_account set username = $1, password = $2, description = $3  where id = $4", account.Username,account.Password, account.Description, account.Id)
	return err	
}
func(repo * ScannerAccount)DeleteAccountById(id string) error {
	_, err := repo.db.Exec("Update system.scanner_account set deleted_at = now() where id = $1", id)
	return err	
}
func NewScannerAccountRepository(db * sqlx.DB)ScannerAccountRepository {
	return &ScannerAccount {
		db: db,
	}
}
