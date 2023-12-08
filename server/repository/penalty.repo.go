package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type PenaltyRepository struct {
	db *sqlx.DB
}


func NewPenaltyRepository() PenaltyRepositoryInterface{
	return &PenaltyRepository{
		db: postgresdb.GetOrCreateInstance(),
	}

}

func(repo * PenaltyRepository) GetPenalties()[]model.Penalty{

	penalties := make([]model.Penalty, 0)
	query := `
	SELECT penalty.id, description,account_id, amount,settled_at, penalty.created_at, json_build_object('id', account.id, 'displayName', 
		display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as account,
		(case when settled_at is not null then true else false end) as is_settled
		FROM borrowing.penalty inner join system.account on penalty.account_id = account.id
		ORDER BY created_at DESC`
	
	selectErr := repo.db.Select(&penalties, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(),slimlog.Function("PenaltyRepository.GetPenalties") ,slimlog.Error("selectErr"))
	}

	return penalties
}
func (repo * PenaltyRepository)UpdatePenaltySettlement(id string, isSettle bool) error{
	settleQuery  := `
		Update borrowing.penalty SET settled_at = NOW() where id  = $1
	`
	unSettleQuery := `
	Update borrowing.penalty SET settled_at = null where id  = $1
	`

	if(isSettle){
		_,settleErr := repo.db.Exec(settleQuery, id)
		if settleErr != nil {
			logger.Error(settleErr.Error(), slimlog.Function("PenaltyRepository.UpdatePenaltySettlement") , slimlog.Error("settleErr"))
			return settleErr
		}


	}else{
		_,unSettleErr := repo.db.Exec(unSettleQuery, id)
        if unSettleErr!= nil {
            logger.Error(unSettleErr.Error(), slimlog.Function("PenaltyRepository.UpdatePenaltySettlement"), slimlog.Error("unSettleErr"))
            return unSettleErr
        }
	}

	return nil
}
func (repo * PenaltyRepository) AddPenalty(penalty model.Penalty ) error {
	query := `
    INSERT INTO borrowing.penalty (description, account_id, amount) VALUES ($1, $2, $3)
    `
    _,insertErr := repo.db.Exec(query, penalty.Description, penalty.AccountId, penalty.Amount)
    if insertErr != nil {
        logger.Error(insertErr.Error(), slimlog.Function("PenaltyRepository.AddPenalty"), slimlog.Error("inserErr"))
        return insertErr
    }
	return nil
}
func (repo * PenaltyRepository) UpdatePenalty(penalty model.Penalty) error {
	query := `
   		 UPDATE borrowing.penalty SET description = $1, account_id = $2, amount = $3  where id = $4`
    _,updateErr := repo.db.Exec(query, penalty.Description, penalty.AccountId, penalty.Amount, penalty.Id)
    if updateErr != nil {
        logger.Error(updateErr.Error(), slimlog.Function("PenaltyRepository.UpdatePenalty"), slimlog.Error("updateErr"))
        return updateErr
    }
	return nil
}


type PenaltyRepositoryInterface interface{
	GetPenalties()[]model.Penalty
	UpdatePenaltySettlement(id string, isSettle bool) error
	AddPenalty(penalty model.Penalty ) error
	UpdatePenalty(penalty model.Penalty ) error
}
