package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)



type Game struct {
	db * sqlx.DB
}
type GameRepository interface{
	NewGame(model.Game) error
	GetGames() ([]model.Game, error)
	UpdateGame(game model.Game) error
	DeleteGame(id string) error 
	Log(log model.GameLog) error
	GetLogs()([]model.GameLog, error)
}
func NewGameRepository () GameRepository {
	return &Game{
		db: db.Connect(),
	}
}
func (repo *Game) NewGame(game model.Game) error {
	_, err := repo.db.Exec("INSERT INTO services.game (name, description)VALUES($1, $2)", game.Name, game.Description)
	return err
}
func (repo *Game) UpdateGame(game model.Game) error {
	_, err := repo.db.Exec("UPDATE services.game set name = $1, description = $2 where id = $3", game.Name, game.Description, game.Id)
	return err
}
func (repo *Game) GetGames() ([]model.Game, error) {
	games := make([]model.Game, 0)
	err := repo.db.Select(&games, "SELECT id, name, description FROM services.game where deleted_at is null ORDER BY created_at desc")
	return games, err 
}
func (repo * Game)DeleteGame(id string) error {
	_, err := repo.db.Exec("UPDATE services.game SET deleted_at = NOW() where id = $1", id)
	return err
}