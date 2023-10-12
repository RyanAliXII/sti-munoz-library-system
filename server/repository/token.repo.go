package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)
type Token struct {
	db * sqlx.DB
}
type TokenRepository interface {
	NewToken(token model.Token) error
}
func NewTokenRepository() TokenRepository {
	return &Token{
		db: db.Connect(),
	}
}
func(repo * Token)NewToken(token model.Token) error {
	_,err := repo.db.Exec("INSERT INTO system.token(id, token) VALUES($1, $2)", token.Id, token.Value)
	return err
}
