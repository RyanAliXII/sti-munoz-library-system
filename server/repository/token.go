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
	GetTokenByJTI(jti string) (model.Token, error) 
	RevokeToken(jti string) (error)
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
func(repo * Token)GetTokenByJTI(jti string) (model.Token, error) {
	token := model.Token{}
	query := `SELECT id, token, (CASE WHEN revoked_at is null then false else true end) as is_revoked FROM system.token where id = $1 LIMIT 1`
	err := repo.db.Get(&token, query, jti)
	return token, err
}
func(repo * Token)RevokeToken(jti string) (error) {
	_, err := repo.db.Exec("UPDATE system.token set revoked_at = now() where id = $1", jti)
	return err
}


