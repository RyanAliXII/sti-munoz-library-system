package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/jmoiron/sqlx"
)



type ClientLogRepository interface {


}

type ClientLog struct {
	db * sqlx.DB
}
func(repo *ClientLog) NewLog(clientId string) error {
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	//check if client has logged 10 mins ago, 
	//if has logged 10 mins ago then dont log in the database.
	//record count is defaulted to 1, this will assume that the user has logged 10 mins ago
	recordCount := 1 
	repo.db.Get(&recordCount, "SELECT count(1) as recordCount FROM system.client_log where client_id = $1 and created_at < NOW() + INTERVAL '10 minutes'  LIMIT 1", clientId)
    if recordCount == 1 {
		transaction.Rollback()
		return nil
	}
	_, err = transaction.Exec("INSERT INTO system.client_log(client_id)VALUES(?)", clientId)
	return err
}

func NewClientLog()ClientLogRepository {
	return &ClientLog{db : db.Connect()}
}


