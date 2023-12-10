package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type Notification struct {
	db * sqlx.DB
}
func NewNotificationRepository () NotificationRepository {
	return &Notification{
		db: db.Connect(),
	}
}
type NotificationRepository interface {
		NotifyAdminsWithPermission( notif model.AdminNotification, permission string ) error
		GetAdminNotificationByAccountId(accountId string) ([]model.AdminNotification, error)
}
func(repo *  Notification) getUserWithPermission(permission string) ([]model.AccountJSON, error){
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
