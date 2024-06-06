package repository

import (
	"fmt"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
)


func(repo * Account)ActivateAccountBulk(accounts []model.AccountActivation) error {
	
	dialect := goqu.Dialect("postgres")
	for _, account := range accounts {
		name := fmt.Sprintf("%s%s", strings.ToLower(account.GivenName), strings.ToLower(account.Surname))
		ds := dialect.Update(goqu.T("account").Schema("system")).Prepared(true)
		
		if(account.ProgramId > 0 ){
			ds = ds.Set(goqu.Record{
				"program_id" : account.ProgramId,
				"active_until" : account.ActiveUntil,
				"student_number": account.StudentNumber,
				"type_id" : goqu.L("null"),
			})
			
			
		}else{
			ds = ds.Set(goqu.Record{
				"type_id" : account.UserType, 
				"active_until" : account.ActiveUntil,
				"student_number" : account.StudentNumber,
				"program_id" : goqu.L("null"),
			})
		}
		ds = ds.Where(goqu.L("email =  ? OR LOWER(CONCAT(given_name, surname)) = ?", account.Email, name))
		query, args, err := ds.ToSQL()
		if err != nil {
			return err
		}

		_, err = repo.db.Exec(query,args...)
		if err != nil {		
			return err
		}
	}
	return nil;
}
func (repo * Account)ActivateAccounts(accountIds []string,  userTypeId int, programId int, activeUntil string, studentNumber string) error {
	dialect := goqu.Dialect("postgres")
	ds := dialect.Update(goqu.T("account").Schema("system")).Prepared(true)
	record := goqu.Record{}
	if(len(accountIds) == 1){
		record["student_number"] = studentNumber
		
	}
	
	if(programId > 0 ){
		record["program_id"] = programId
		record["active_until"] = activeUntil
		record["type_id"] = goqu.L("null")
		ds = ds.Set(record)
			
	}else{
		record["type_id"] = userTypeId
		record["active_until"] = activeUntil
		record["program_id"] = goqu.L("null")
		ds = ds.Set(record)
	}
	ds = ds.Where(goqu.ExOr{
		"id" :  accountIds,
	})
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	
	return err
}

func (repo * Account)DeactiveAccounts(accountIds []string) error {
	dialect := goqu.Dialect("postgres")
	ds := dialect.Update(goqu.T("account").Schema("system")).Prepared(true).Set(goqu.Record{
		"active_until" : goqu.L("null"),
	})
	ds = ds.Where(goqu.ExOr{
		"id" :  accountIds,
	})
	query, args, err := ds.ToSQL()
	
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	
	return err
}