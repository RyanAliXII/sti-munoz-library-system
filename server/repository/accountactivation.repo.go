package repository

import (
	"fmt"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
)


func(repo * AccountRepository)ActivateAccountBulk(accounts []model.AccountActivation) error {
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	dialect := goqu.Dialect("postgres")
	for _, account := range accounts {
		name := fmt.Sprintf("%s%s", strings.ToLower(account.GivenName), strings.ToLower(account.Surname))
		ds := dialect.Update(goqu.T("account").Schema("system")).Prepared(true)
		
		if(account.ProgramId > 0 ){
			ds = ds.Set(goqu.Record{
				"program_id" : account.ProgramId,
				"active_until" : account.ActiveUntil,
			})
			
			
		}else{
			ds = ds.Set(goqu.Record{
				"type_id" : account.UserType, 
				"active_until" : account.ActiveUntil,
			})
		}
		ds = ds.Where(goqu.L("email =  ? OR LOWER(CONCAT(given_name, surname)) = ?", account.Email, name))
		query, args, err := ds.ToSQL()
		if err != nil {
			return err
		}

		_, err = transaction.Exec(query,args...)
		if err != nil {
			transaction.Rollback()
			return err
		}
	}
	transaction.Commit()
	return nil;
}