package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)


type GameLogFilter struct {
	From string
	To string
	filter.Filter
}
func(repo * Game)Log(log model.GameLog) error{
	_, err := repo.db.Exec("INSERT INTO services.game_log (account_id, game_id) VALUES($1, $2)", log.AccountId, log.GameId)
	return err
}

func (repo * Game)GetLogs(filter * GameLogFilter)([]model.GameLog, error) {
	logs := make([]model.GameLog, 0)
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(
		goqu.C("id").Table("game_log"),
		goqu.C("game_id"),
		goqu.L(`
		json_build_object(
			'id', account.id, 
			'givenName', account.given_name,
			'surname', account.surname, 
			'displayName',account.display_name,
			'email', account.email,
			'profilePicture', account.profile_picture
			) 
		`).As("client"),
		goqu.L(`
		json_build_object(
			'id',game.id, 
			'name', game.name, 
			'description', game.description)
	    `).As("game"),
		goqu.C("created_at").Table("game_log"),
	).From(goqu.T("game_log").Schema("services")).
	Prepared(true).
	InnerJoin(goqu.T("account").Schema("system"), goqu.On(goqu.Ex{
		"game_log.account_id": goqu.I("account.id"),
	})).
	InnerJoin(goqu.T("game").Schema("services"), goqu.On(goqu.Ex{
		"game_log.game_id": goqu.I("game.id"),
	}))
	ds = repo.buildGameLogFilters(ds, filter)
	ds = ds.Order(exp.NewOrderedExpression(goqu.I("game_log.created_at"), exp.DescSortDir, exp.NoNullsSortType)).
	Limit(uint(filter.Limit)).
	Offset(uint(filter.Offset))
	query, args, err := ds.ToSQL()
	if err != nil {
		return logs, err
	}
	err = repo.db.Select(&logs, query, args...)
	return logs, err
}
func (repo *Game)buildGameLogFilters(ds * goqu.SelectDataset, filter * GameLogFilter)*goqu.SelectDataset{
	if(len(filter.From) > 0 && len(filter.To) > 0) {
		ds = ds.Where(
			goqu.L("date(game_log.created_at at time zone 'PHT')").Between(goqu.Range(filter.From, filter.To)),
		) 
	}
	return ds
}
func (repo * Game)DeleteLog(id string)(error){
	_, err := repo.db.Exec("UPDATE services.game_log set deleted_at = now() where id = $1 and deleted_at is null", id)
	return err
}

func (repo * Game)UpdateLog(log model.GameLog)(error){
	_, err := repo.db.Exec("UPDATE services.game_log set game_id = $1, account_id = $2 where id = $3 and deleted_at is null", log.GameId, log.AccountId, log.Id )
	return err
}