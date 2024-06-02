package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type System struct {
	db *sqlx.DB
}

func (repo *System) NewRole(role model.Role) error {
	if len(role.Permissions) == 0 {
		return fmt.Errorf("no permissions")
	}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	roleId := 0
	err = transaction.Get(&roleId,"Insert into system.role(name) VALUES ($1) RETURNING id", role.Name)
	if err != nil {
		transaction.Rollback()
		return err
	}
	dialect := goqu.Dialect("postgres")
	records := make([]goqu.Record, 0)
	for _, p := range role.Permissions{
		records = append(records, goqu.Record{
			"value": p,
			"role_id": roleId,
		})
	}
	ds := dialect.Insert(goqu.T("role_permission").Schema("system")).Prepared(true).Rows(records)
	query, args, err := ds.ToSQL()
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec(query, args...)
	if err != nil {
		transaction.Rollback()
	}
	transaction.Commit()
	return err
}
func (repo *System) UpdateRole(role model.Role) error {
	if len(role.Permissions) == 0 {
		return fmt.Errorf("no permissions")
	}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = repo.db.Exec("UPDATE system.role SET  name = $1 where id = $2", role.Name,  role.Id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec("Delete from system.role_permission where role_id = $1", role.Id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	dialect := goqu.Dialect("postgres")
	records := make([]goqu.Record, 0)
	for _, p := range role.Permissions{
		records = append(records, goqu.Record{
			"value": p,
			"role_id": role.Id,
		})
	}
	ds := dialect.Insert(goqu.T("role_permission").Schema("system")).Prepared(true).Rows(records)
	query, args, err := ds.ToSQL()
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec(query, args...)
	if err != nil {
		transaction.Rollback()
	}
	transaction.Commit()
	return err
}
func (repo *System) GetRoles() []model.Role {

	roles := make([]model.Role, 0)
	selectErr := repo.db.Select(&roles, `Select role.id, name, COALESCE(ARRAY_AGG(role_permission.value),'{}') as permissions from system.role 
	INNER JOIN system.role_permission on role.id = role_permission.role_id GROUP BY role.id order by role.created_at desc`)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("System.GetRoles"), slimlog.Error("selectErr"))
	}
	return roles
}

func (repo *System) AssignRole(accountRoles model.AccountRoles) error {
	dialect := goqu.Dialect("postgres")
	rows := make([]goqu.Record, 0)
	for _, ar := range accountRoles {
		rows = append(rows, goqu.Record{
			"account_id": ar.Account.Id,
			"role_id":    ar.Role.Id,
		})
	}
	ds := dialect.From(goqu.T("account_role").Schema("system")).
		Prepared(true).Insert().
		Rows(rows).
		OnConflict(exp.NewDoUpdateConflictExpression("account_id", goqu.Record{"role_id": goqu.L("EXCLUDED.role_id")}))

	query, args, _ := ds.ToSQL()

	_, insertErr := repo.db.Exec(query, args...)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("System.AssignRole"), slimlog.Error("insertErr"))
	}
	return insertErr
}
func(repo * System) GetAccountsWithAssignedRoles() model.AccountRoles{

	accountRoles := make(model.AccountRoles, 0)
	query := `SELECT account.json_format as account,
	json_build_object(
	  'id', role.id,
	  'name', role.name,
	  'permissions', COALESCE(ARRAY_AGG(role_permission.value),'{}')
	) as role
   from system.account_role
   INNER JOIN account_view as account on account_role.account_id = account.id
   INNER JOIN system.role on account_role.role_id = role.id
   INNER JOIN system.role_permission on role.id  = role_permission.role_id GROUP BY account.id, account_role.id, role.id, account.json_format`
	

	selectErr := repo.db.Select(&accountRoles, query)
	if selectErr != nil{
		logger.Error(selectErr.Error(), slimlog.Function("System.GetAccountWithAssignedRoles"), slimlog.Error("getErr"))
		
	}
	return accountRoles
}
func (repo * System) RemoveRoleAssignment(roleId int , accountId string)error{

	_, deleteErr := repo.db.Exec("DELETE FROM system.account_role where role_id = $1 AND account_id = $2", roleId, accountId)
	if deleteErr != nil{
		logger.Error(deleteErr.Error(), slimlog.Function("System.RemoveRoleAssignments"), slimlog.Error("deleteErr"))
		return deleteErr
	}	
	return nil
}
func NewSystemRepository(db * sqlx.DB) SystemRepository {
	return &System{
		db: db,
	}
}
func(repo * System) GetUserWithPermission(permission string) ([]model.AccountJSON, error){
	accounts := make([]model.AccountJSON, 0)
	query := `SELECT 
	account.json_format as account
    from system.account_role
    INNER JOIN account_view as account on account_role.account_id = account.id
    INNER JOIN system.role on account_role.role_id = role.id
    INNER JOIN system.role_permission on role.id  = role_permission.role_id 
	where value = $1
  `
  err := repo.db.Select(&accounts, query, permission)
  return accounts, err
}

type SystemRepository interface {
	NewRole(role model.Role) error
	GetRoles() []model.Role
	UpdateRole(role model.Role) error
	AssignRole(accountRoles model.AccountRoles) error
	GetAccountsWithAssignedRoles() model.AccountRoles
	RemoveRoleAssignment(roleId int , accountId string)error
	GetUserWithPermission(permission string) ([]model.AccountJSON, error)
}
