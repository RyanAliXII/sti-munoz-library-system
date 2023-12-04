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
	GetUserTypesToMap() (map[int]model.UserType, error)
	GetUserProgramsAndStrandsToMap()(map[string]model.UserProgramOrStrand,error)
	NewUserType(userType model.UserType)(error)
	
}

func (repo * User)GetUserTypes()([]model.UserType, error) {
	types := make([]model.UserType, 0)
	err := repo.db.Select(&types,"SELECT id, name, has_program from system.user_type order by id asc")
	return types, err
}
func (repo * User)NewUserType(userType model.UserType)(error){
	_, err := repo.db.Exec("INSERT INTO user_type (name, has_program)VALUES($1, $2)", userType.Name, userType.HasProgram)
	return err
}
func (repo * User)GetUserProgramsAndStrands()([]model.UserProgramOrStrand,error){
	programs := make([]model.UserProgramOrStrand, 0)
	err := repo.db.Select(&programs,"SELECT id, code, name, user_type_id from system.user_program")
	return programs, err
}
func (repo * User)GetUserTypesToMap() (map[int]model.UserType, error){
	typesMap := make(map[int]model.UserType, 0)
	types, err := repo.GetUserTypes()
	if err != nil {
		return typesMap, err
	}
	for _, t := range types {
		typesMap[t.Id] = t
	}
	return typesMap, nil
}
func (repo * User)GetUserProgramsAndStrandsToMap()(map[string]model.UserProgramOrStrand,error){
	programsMap := make(map[string]model.UserProgramOrStrand, 0)
	programs, err := repo.GetUserProgramsAndStrands()
	if err != nil {
		return programsMap, err
	}
	for _, program := range programs {
		programsMap[program.Code] = program
	}
	return programsMap, nil
}