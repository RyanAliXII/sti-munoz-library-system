package repository

import (
	"fmt"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/jmoiron/sqlx"
)

type ClientRepository struct {
	db *sqlx.DB
}

func (repo *ClientRepository) GetAccounts(filter Filter) []model.Account {
	query := `SELECT * FROM client.account LIMIT $1 OFFSET $2`
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("ClientRepository.GetAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}

func (repo *ClientRepository) SearchAccounts(filter Filter) []model.Account {
	query := `SELECT * FROM client.account WHERE (given_name ILIKE $1 OR surname ILIKE $2 OR email ILIKE $3 OR display_name ILIKE $4 ) LIMIT $5 OFFSET $6`
	var accounts []model.Account = make([]model.Account, 0)
	keyword := fmt.Sprint("%", filter.Keyword, "%")
	selectErr := repo.db.Select(&accounts, query, keyword, keyword, keyword, keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("ClientRepository.GetAccounts"), slimlog.Error("selectErr"))
	}
	return accounts
}

func NewClientRepository(db *sqlx.DB) ClientRepositoryInterface {
	return &ClientRepository{
		db: db,
	}
}

type ClientRepositoryInterface interface {
	GetAccounts(filter Filter) []model.Account
	SearchAccounts(filter Filter) []model.Account
}
