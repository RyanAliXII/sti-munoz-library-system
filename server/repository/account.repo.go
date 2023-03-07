package repository

import (
	"database/sql"
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"
	"time"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type AccountRepository struct {
	db *sqlx.DB
}

func (repo *AccountRepository) GetAccounts(filter Filter) []model.Account {
	query := `SELECT id, email, display_name, given_name, surname FROM system.account LIMIT $1 OFFSET $2`
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("AccountRepository.GetAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}

func (repo *AccountRepository) SearchAccounts(filter Filter) []model.Account {
	query := `
			SELECT id, email, 
			display_name, 
			given_name, surname, 
			(  ts_rank(search_vector, (phraseto_tsquery('simple',$1) :: text || ':*' ) :: tsquery ) 
			) as search_rank
			FROM system.account where search_vector @@ (phraseto_tsquery('simple', $1) :: text || ':*' ) :: tsquery
			ORDER BY search_rank DESC
			LIMIT $2
			OFFSET $3
		`
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("AccountRepository.SearchAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}
func (repo *AccountRepository) NewAccounts(accounts *[]model.Account) error {
	var accountRows []goqu.Record = make([]goqu.Record, 0)
	dialect := goqu.Dialect("postgres")
	for _, account := range *accounts {
		accountRows = append(accountRows, goqu.Record{"id": account.Id,
			"display_name": account.DisplayName, "surname": account.Surname, "given_name": account.GivenName, "email": account.Email})
	}
	accountDs := dialect.From("system.account").
		Prepared(true).Insert().Rows(accountRows).
		OnConflict(
			exp.NewDoUpdateConflictExpression("id", goqu.Record{"id": goqu.L("EXCLUDED.id"),
				"display_name": goqu.L("EXCLUDED.display_name"), "surname": goqu.L("EXCLUDED.surname"),
				"given_name": goqu.L("EXCLUDED.given_name"), "email": goqu.L("EXCLUDED.email")}))
	query, args, toQueryErr := accountDs.ToSQL()
	if toQueryErr != nil {
		logger.Error(toQueryErr.Error(), slimlog.Function("AccountRepository.NewAccounts"))
		return toQueryErr
	}
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		return transactErr
	}
	insertResult, insertErr := transaction.Exec(query, args...)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("AccountRepository.NewAccounts"))
		transaction.Rollback()
		return insertErr
	}
	accountsInserted, _ := insertResult.RowsAffected()
	transaction.Commit()
	logger.Info("New accounts created.", slimlog.AffectedRows(accountsInserted))

	return nil
}
func (repo *AccountRepository) VerifyAndUpdateAccount(account model.Account) error {

	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		logger.Error(transactErr.Error(), slimlog.Function("AccountRepository.VerifyAndUpdateAccount"), slimlog.Error("transactErr"))
		transaction.Rollback()
		return transactErr
	}
	registeredAccount := model.Account{}
	getErr := transaction.Get(&registeredAccount, "Select id, display_name, email, surname, given_name, updated_at from system.account where id = $1 or email = $2", account.Id, account.Email)
	if getErr != nil {
		if getErr == sql.ErrNoRows {
			_, insertErr := transaction.Exec("Insert into system.account(id, display_name, email, surname, given_name) VALUES ($1, $2, $3, $4, $5)",
				account.Id, account.DisplayName, account.Email, account.Surname, account.GivenName)
			if insertErr != nil {
				logger.Error(insertErr.Error(), slimlog.Function("AccountRepository.VerifyAndUpdateAccount"), slimlog.Error("insertErr"))
				transaction.Rollback()
				return insertErr
			}
			logger.Info("Inserting user account.", zap.String("accountId", account.Id), slimlog.Function("AccountRepository.VerifyAndUpdateAccount"))
			transaction.Commit()
			return nil
		}
		transaction.Rollback()
		logger.Error(getErr.Error(), slimlog.Function("AccountRepository.VerifyAndUpdateAccount"), slimlog.Error("getErr"))
		return getErr
	}
	OneMonth := time.Hour * 730

	if len(registeredAccount.Id) > 0 {

		if time.Now().Equal(registeredAccount.UpdatedAt.Time.Add(OneMonth)) || time.Now().After(registeredAccount.UpdatedAt.Add(OneMonth)) {
			_, updateErr := transaction.Exec("Update system.account set display_name = $1, email = $2, surname = $3, given_name = $4, updated_at = now() where id = $5 or email = $2",
				account.DisplayName, account.Email, account.Surname, account.GivenName, account.Id)
			if updateErr != nil {
				logger.Error(updateErr.Error(), slimlog.Function("AccountRepository.VerifyAndUpdateAccount"), slimlog.Error("updateErr"))
				transaction.Rollback()
				return updateErr
			}
			logger.Info("Updating user account.", zap.String("accountId", registeredAccount.Id), slimlog.Function("AccountRepository.VerifyAndUpdateAccount"))
		}

	}
	transaction.Commit()
	return nil
}
func NewAccountRepository() AccountRepositoryInterface {
	return &AccountRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type AccountRepositoryInterface interface {
	GetAccounts(filter Filter) []model.Account
	SearchAccounts(filter Filter) []model.Account
	NewAccounts(accounts *[]model.Account) error
	VerifyAndUpdateAccount(account model.Account) error
}
