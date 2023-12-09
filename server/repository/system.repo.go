package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type SystemRepository struct {
	db *sqlx.DB
}

func (repo *SystemRepository) NewRole(role model.Role) error {
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
func (repo *SystemRepository) UpdateRole(role model.Role) error {
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
func (repo *SystemRepository) GetRoles() []model.Role {

	roles := make([]model.Role, 0)
	selectErr := repo.db.Select(&roles, `Select role.id, name, COALESCE(ARRAY_AGG(role_permission.value),'{}') as permissions from system.role 
	INNER JOIN system.role_permission on role.id = role_permission.role_id GROUP BY role.id order by role.created_at desc`)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("SystemRepository.GetRoles"), slimlog.Error("selectErr"))
	}
	return roles
}

func (repo *SystemRepository) AssignRole(accountRoles model.AccountRoles) error {
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
		logger.Error(insertErr.Error(), slimlog.Function("SystemRepository.AssignRole"), slimlog.Error("insertErr"))
	}
	return insertErr
}
func(repo * SystemRepository) GetAccountsWithAssignedRoles() model.AccountRoles{

	accountRoles := make(model.AccountRoles, 0)
	query := `SELECT json_build_object('id', account.id, 
	'givenName', account.given_name,
	 'surname', account.surname, 
	'displayName',account.display_name,
	 'email', account.email) as account,
	 json_build_object(
	   'id', role.id,
	   'name', role.name,
	   'permissions', role.permissions
	 ) as role
	from system.account_role
	INNER JOIN system.account on account_role.account_id = account.id
	INNER JOIN system.role on account_role.role_id = role.id`

	selectErr := repo.db.Select(&accountRoles, query)
	if selectErr != nil{
		logger.Error(selectErr.Error(), slimlog.Function("SystemRepository.GetAccountWithAssignedRoles"), slimlog.Error("getErr"))
		
	}
	return accountRoles
}
func (repo * SystemRepository) RemoveRoleAssignment(roleId int , accountId string)error{

	_, deleteErr := repo.db.Exec("DELETE FROM system.account_role where role_id = $1 AND account_id = $2", roleId, accountId)
	if deleteErr != nil{
		logger.Error(deleteErr.Error(), slimlog.Function("SystemRepository.RemoveRoleAssignments"), slimlog.Error("deleteErr"))
		return deleteErr
	}	
	return nil
}
func NewSystemRepository() SystemRepositoryInterface {
	db := postgresdb.GetOrCreateInstance()
	return &SystemRepository{
		db: db,
	}
}

type SystemRepositoryInterface interface {
	NewRole(role model.Role) error
	GetRoles() []model.Role
	UpdateRole(role model.Role) error
	AssignRole(accountRoles model.AccountRoles) error
	GetAccountsWithAssignedRoles() model.AccountRoles
	RemoveRoleAssignment(roleId int , accountId string)error
	
}
