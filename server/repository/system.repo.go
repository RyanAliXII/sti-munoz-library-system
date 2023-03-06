package repository

import (
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

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
}
