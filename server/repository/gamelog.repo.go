package repository

import "github.com/RyanAliXII/sti-munoz-library-system/server/model"

func(repo * Game)Log(log model.GameLog) error{
	_, err := repo.db.Exec("INSERT INTO services.game_log (account_id, game_id) VALUES($1, $2)", log.AccountId, log.GameId)
	return err
}

func (repo * Game)GetLogs()([]model.GameLog, error) {
	logs := make([]model.GameLog, 0)

	query := `SELECT game_log.id, game_id, 
	account_id, 
	json_build_object('id', account.id, 
	'givenName', account.given_name,
	'surname', account.surname, 
	'displayName',account.display_name,
	'email', account.email,
	'profilePicture', account.profile_picture
	) as client,
	json_build_object('id',
	game.id, 'name', 
	game.name, 
	'description', game.description) as game,
	game_log.created_at
	from services.game_log 
	INNER JOIN system.account on game_log.account_id = account.id
	INNER JOIN services.game on game_id = game.id
	where game_log.deleted_at is null
	ORDER BY game_log.created_at DESC
	`
	err := repo.db.Select(&logs, query)
	return logs, err
}