package repository

import (
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type ClientRepository struct {
	db *sqlx.DB
}

func (repo *ClientRepository) GetAccounts(filter Filter) []model.Account {
	query := `SELECT id, email, display_name, given_name, surname FROM client.account LIMIT $1 OFFSET $2`
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("ClientRepository.GetAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}

func (repo *ClientRepository) SearchAccounts(filter Filter) []model.Account {
	query := `
			SELECT id, email, 
			display_name, 
			given_name, surname, 
			(  ts_rank(search_vector, (phraseto_tsquery('simple',$1) :: text || ':*' ) :: tsquery ) 
			) as search_rank
			FROM client.account where search_vector @@ (phraseto_tsquery('simple', $1) :: text || ':*' ) :: tsquery
			ORDER BY search_rank DESC
			LIMIT $2
			OFFSET $3
		`
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("ClientRepository.SearchAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}
func (repo *ClientRepository) NewAccounts(accounts *[]model.Account) error {
	var accountRows []goqu.Record = make([]goqu.Record, 0)
	dialect := goqu.Dialect("postgres")
	for _, account := range *accounts {
		accountRows = append(accountRows, goqu.Record{"id": account.Id,
			"display_name": account.DisplayName, "surname": account.Surname, "given_name": account.GivenName, "email": account.Email})
	}

	accountDs := dialect.From("client.account").
		Prepared(true).Insert().Rows(accountRows).
		OnConflict(
			exp.NewDoUpdateConflictExpression("id", goqu.Record{"id": goqu.L("EXCLUDED.id"),
				"display_name": goqu.L("EXCLUDED.display_name"), "surname": goqu.L("EXCLUDED.surname"),
				"given_name": goqu.L("EXCLUDED.given_name"), "email": goqu.L("EXCLUDED.email")}))
	query, args, toQueryErr := accountDs.ToSQL()
	if toQueryErr != nil {
		return toQueryErr
	}
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		return transactErr
	}
	insertResult, insertErr := transaction.Exec(query, args...)
	if insertErr != nil {
		transaction.Rollback()
		return insertErr
	}
	accountsInserted, _ := insertResult.RowsAffected()
	transaction.Commit()
	logger.Info("New accounts created.", slimlog.AffectedRows(accountsInserted))

	return nil
}

func NewClientRepository() ClientRepositoryInterface {
	return &ClientRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type ClientRepositoryInterface interface {
	GetAccounts(filter Filter) []model.Account
	SearchAccounts(filter Filter) []model.Account
	NewAccounts(accounts *[]model.Account) error
}
