package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type AccountRepository struct {
	db *sqlx.DB
}

func (repo *AccountRepository) GetAccounts(filter * filter.Filter) []model.Account {
	query := `SELECT id, email, display_name, given_name, surname, meta_data FROM account_view LIMIT $1 OFFSET $2`
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("AccountRepository.GetAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}
func (repo *AccountRepository) GetAccountById(id string) model.Account {
	query := `SELECT id, email, display_name, given_name, surname, meta_data FROM account_view where id = $1 LIMIT 1`
	account := model.Account{}

	getErr := repo.db.Get(&account, query, id)
	if getErr != nil {
		logger.Error(getErr.Error(), slimlog.Function("AccountRepository.GetAccountById"), slimlog.Error("getErr"))
	}
	return account
}

func (repo *AccountRepository) SearchAccounts(filter Filter) []model.Account {
	query := `
			SELECT id, email, 
			display_name, 
			given_name, surname,meta_data
			FROM account_view where search_vector @@ (phraseto_tsquery('simple', $1) :: text || ':*' ) :: tsquery
			ORDER BY (  ts_rank(search_vector, (phraseto_tsquery('simple',$1) :: text || ':*' ) :: tsquery ) 
			) DESC
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
	fmt.Println(registeredAccount)
	if getErr != nil {
		if getErr == sql.ErrNoRows {
				logger.Info("User doesn't not exist inserting in database.")
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
func (repo *AccountRepository) GetRoleByAccountId(accountId string) (model.Role, error) {

	role := model.Role{}
	query := `SELECT COALESCE(role.id, 0) as id, COALESCE(role.name,'') as name, COALESCE(permissions, '{}') as permissions from system.account as ac
		LEFT JOIN system.account_role as ar on ac.id = ar.account_id
		LEFT JOIN system.role on ar.role_id = role.id
		where ac.id = $1`

	getErr := repo.db.Get(&role, query, accountId)
	if getErr != nil {
		logger.Error(getErr.Error(), slimlog.Function("AccountRepository.GetRoleByAccountId"), slimlog.Error("getErr"))
	}
	return role, getErr
}
func(repo * AccountRepository) GetAccountsWithAssignedRoles()model.AccountRoles{

	accountRoles := make(model.AccountRoles, 0)
	query := `SELECT json_build_object('id', account.id, 
	'givenName', account.given_name,
	 'surname', account.surname, 
	'displayName',account.display_name,
	 'email', account.email) as account,
	 json_build_object(
	   'id', role.id,
	   'name', role.name,
	   'permissions', role.permissions
	 ) as role
	from system.account_role
	INNER JOIN system.account on account_role.account_id = account.id
	INNER JOIN system.role on account_role.role_id = role.id`

	selectErr := repo.db.Select(&accountRoles, query)
	if selectErr != nil{
		logger.Error(selectErr.Error(), slimlog.Function("AccountRepository.GetRoles"), slimlog.Error("getErr"))
		
	}
	return accountRoles
}
func NewAccountRepository() AccountRepositoryInterface {
	return &AccountRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type AccountRepositoryInterface interface {
	GetAccounts( * filter.Filter) []model.Account
	SearchAccounts(filter Filter) []model.Account
	NewAccounts(accounts *[]model.Account) error
	VerifyAndUpdateAccount(account model.Account) error
	GetRoleByAccountId(accountId string) (model.Role, error)
	GetAccountsWithAssignedRoles() model.AccountRoles
	GetAccountById(id string) model.Account
	
}
