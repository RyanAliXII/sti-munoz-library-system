package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type User struct {
	db * sqlx.DB
}
func NewUserRepository (db * sqlx.DB) UserRepository {
	return &User{
		db : db,
	}
}
type UserRepository interface {
	GetUserTypes() ([]model.UserType, error)
	GetUserProgramsAndStrands()([]model.UserProgramOrStrand, error) 
	GetUserTypesToMap() (map[int]model.UserType, error)
	GetUserProgramsAndStrandsToMap()(map[string]model.UserProgramOrStrand,error)
	NewUserType(userType model.UserType)(error)
	UpdateUserType(userType model.UserType)(error)
	GetUserTypesWithProgram()([]model.UserType, error)
	NewProgram(program model.UserProgramOrStrand) error
	UpdateProgram(program model.UserProgramOrStrand)error
	GetUserProgramsAndStrandsByType(id int)([]model.UserProgramOrStrand,error)
}

func (repo * User)GetUserTypes()([]model.UserType, error) {
	types := make([]model.UserType, 0)
	err := repo.db.Select(&types,"SELECT id, name, has_program, max_allowed_borrowed_books, max_unique_device_reservation_per_day from system.user_type order by id asc")
	return types, err
}
func (repo * User)GetUserTypesWithProgram()([]model.UserType, error) {
	types := make([]model.UserType, 0)
	err := repo.db.Select(&types,"SELECT id, name, has_program, max_unique_device_reservation_per_day  from system.user_type where has_program order by id asc")
	return types, err
}
func (repo * User)NewUserType(userType model.UserType)(error){
	_, err := repo.db.Exec("INSERT INTO system.user_type (name, has_program, max_allowed_borrowed_books, max_unique_device_reservation_per_day)VALUES($1, $2, $3)", userType.Name, userType.HasProgram, userType.MaxAllowedBorrowedBooks)
	return err
}
func (repo * User)GetUserProgramsAndStrands()([]model.UserProgramOrStrand,error){
	programs := make([]model.UserProgramOrStrand, 0)
	err := repo.db.Select(&programs,`
	SELECT user_program.id, code, user_program.name, user_type_id, 
	JSON_BUILD_OBJECT('id', user_type.id, 'name', user_type.name, 'hasProgram', user_type.has_program)  as user_type
	from system.user_program
	INNER JOIN system.user_type on user_program.user_type_id = user_type.id
	order by code asc`)
	return programs, err
}
func (repo * User)GetUserProgramsAndStrandsByType(id int)([]model.UserProgramOrStrand,error){
	programs := make([]model.UserProgramOrStrand, 0)
	err := repo.db.Select(&programs,`
	SELECT user_program.id, code, user_program.name, user_type_id, 
	JSON_BUILD_OBJECT('id', user_type.id, 'name', user_type.name, 'hasProgram', user_type.has_program)  as user_type
	from system.user_program
	INNER JOIN system.user_type on user_program.user_type_id = user_type.id
	where user_type_id = $1
	order by code asc`, id)
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
func(repo * User)UpdateUserType(userType model.UserType)(error){
	_, err := repo.db.Exec("UPDATE system.user_type set name = $1, has_program = $2, max_allowed_borrowed_books = $3 where id =$4", userType.Name, userType.HasProgram,userType.MaxAllowedBorrowedBooks, userType.Id)
	return err
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

func (repo * User)NewProgram(program model.UserProgramOrStrand)error{
	_, err := repo.db.Exec("INSERT INTO system.user_program(code, name, user_type_id) VALUES($1, $2, $3)", program.Code, program.Name, program.UserTypeId)
	return err
}
func (repo * User)UpdateProgram(program model.UserProgramOrStrand)error{
	_, err := repo.db.Exec("UPDATE system.user_program SET code = $1, name = $2, user_type_id = $3 WHERE id = $4", program.Code, program.Name, program.UserTypeId, program.Id)
	return err
}