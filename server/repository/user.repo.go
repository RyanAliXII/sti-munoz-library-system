package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type User struct {
	db * sqlx.DB
}
func NewUserRepository () UserRepository {
	return &User{
		db : db.Connect()}
}
type UserRepository interface {
	GetUserTypes() ([]model.UserType, error)
	GetUserProgramsAndStrands()([]model.UserProgramOrStrand, error) 
}

func (repo * User)GetUserTypes()([]model.UserType, error) {
	types := make([]model.UserType, 0)
	err := repo.db.Select(&types,"SELECT id, name from system.user_type")
	return types, err
}
func (repo * User)GetUserProgramsAndStrands()([]model.UserProgramOrStrand,error){
	programs := make([]model.UserProgramOrStrand, 0)
	err := repo.db.Select(&programs,"SELECT id, code, name from system.user_program")
	return programs, err
}

