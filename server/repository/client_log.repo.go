package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)



type ClientLogRepository interface {

	NewLog(clientId string, scannerId string) error
}

type ClientLog struct {
	db * sqlx.DB
}
func(repo *ClientLog) NewLog(clientId string, scannerId string) error {
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	//check if client has logged 10 mins ago, 
	//if has logged 10 mins ago then dont log in the database.
	//record count is defaulted to 1, this will assume that the user has logged 10 mins ago
	recordCount := 1 
	err = repo.db.Get(&recordCount, "SELECT count(1) as recordCount FROM system.client_log where client_id = $1 and created_at > NOW() - INTERVAL '10 minutes'  LIMIT 1", clientId)
	if err != nil {
		fmt.Println("GetERR")
		return err
	}
    if recordCount == 1 {
		logger.Info("Client has been logged in, wait for atleast 10 minutes", zap.String("clientId", clientId))
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec("INSERT INTO system.client_log(client_id, scanner_id)VALUES($1,$2)", clientId, scannerId)
	if err != nil {
		fmt.Println("INSERT ERR")
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
}
func (repo * ClientLog) GetLogs() ([]model.ClientLog, error) {
	clientLogs := make([]model.ClientLog, 0)
	query := `
	SELECT cl.id,json_build_object('id', account.id, 
	'givenName', account.given_name,
	 'surname', account.surname, 
	'displayName',account.display_name,
	 'email', account.email) as account,  json_build_object('id', scanner_account.id, 
	'username', scanner_account.username,
	 'description', scanner_account.description 
	) as scanner,
	cl.created_at
	FROM system.client_log as cl
	INNER JOIN system.account on cl.client_id = account.id
	INNER JOIN system.scanner_account on cl.scanner_id = scanner_account.id
	ORDER BY cl.created_at DESC`
	err := repo.db.Select(&clientLogs, query)
	return clientLogs, err
}
func NewClientLog()ClientLogRepository {
	return &ClientLog{db : db.Connect()}
}


