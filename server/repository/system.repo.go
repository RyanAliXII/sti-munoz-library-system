package repository

import (
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type SystemRepository struct {
	db *sqlx.DB
}

func (repo *SystemRepository) NewRole(role model.Role) error {
	_, insertErr := repo.db.Exec("Insert into system.role(name, permissions) VALUES ($1, $2)", role.Name, role.Permissions)

	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("SystemRepository.NewRole"), slimlog.Error("insertErr"))
	}
	return insertErr
}
func (repo *SystemRepository) UpdateRole(role model.Role) error {
	_, updateErr := repo.db.Exec("UPDATE system.role SET name = $1, permissions = $2 where id = $3", role.Name, role.Permissions, role.Id)

	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("SystemRepository.UpdateRole"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo *SystemRepository) GetRoles() []model.Role {

	roles := make([]model.Role, 0)
	selectErr := repo.db.Select(&roles, "Select id,name, permissions from system.role order by created_at desc")
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
}
