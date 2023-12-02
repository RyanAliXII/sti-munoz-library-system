package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)



type ClientLogRepository interface {
	GetLogs(filter *  ClientLogFilter)([]model.ClientLog, Metadata, error)
	NewLog(clientId string, scannerId string) error
	
}

type ClientLog struct {
	db * sqlx.DB
}
type ClientLogFilter struct {
	From string
	To string
	filter.Filter
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
func (repo * ClientLog) GetLogs(filter *  ClientLogFilter) ([]model.ClientLog, Metadata, error) {
	clientLogs := make([]model.ClientLog, 0)
	meta := Metadata{}
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(
		goqu.C("id").Table("cl"),
		goqu.C("created_at").Table("cl"),
		goqu.L(`
		json_build_object(
		'id', account.id, 
		'givenName', account.given_name,
		'surname', account.surname, 
		'displayName',account.display_name,
		'email', account.email)`).As("client"),
		goqu.L(`
		json_build_object(
		'id', scanner_account.id, 
		'username', scanner_account.username,
		'description', scanner_account.description 
		)`).As("scanner"),
	).
	From(goqu.T("client_log").Schema("system").As("cl")).
	InnerJoin(goqu.T("account").Schema("system"), goqu.On(goqu.Ex{
		"cl.client_id" : goqu.I("account.id"),
	})).
	InnerJoin(goqu.T("scanner_account").Schema("system"), goqu.On(goqu.Ex{
		"cl.scanner_id" : goqu.I("scanner_account.id"),
	}))
	if(len(filter.From) > 0  && len(filter.To) > 0){
		ds = ds.Where(
			goqu.L("date(cl.created_at at time zone 'PHT')").Between(goqu.Range(filter.From, filter.To)),
		) 
	}
	ds = ds.Prepared(true).
	Order(exp.NewOrderedExpression(goqu.I("cl.created_at"), exp.DescSortDir, exp.NoNullsSortType)).
	Limit(uint(filter.Limit)).
	Offset(uint(filter.Offset))
	query, args, err :=  ds.ToSQL()

	if err != nil {
		return clientLogs, meta, err
	}
	err = repo.db.Select(&clientLogs, query, args...)
	if err != nil {
		return clientLogs,meta, err
	}

	query = `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM system.client_log`
	err = repo.db.Get(&meta, query, filter.Limit)
	if err != nil {
	return clientLogs, meta, err
	}
	
	return clientLogs, meta, nil
}
func NewClientLog()ClientLogRepository {
	return &ClientLog{db : db.Connect()}
}


