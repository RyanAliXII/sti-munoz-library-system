package repository

import (
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

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

func NewClientRepository(db *sqlx.DB) ClientRepositoryInterface {
	return &ClientRepository{
		db: db,
	}
}

type ClientRepositoryInterface interface {
	GetAccounts(filter Filter) []model.Account
	SearchAccounts(filter Filter) []model.Account
}
