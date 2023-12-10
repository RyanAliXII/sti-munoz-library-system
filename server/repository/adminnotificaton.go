package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/broadcasting"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
)


func(repo * Notification)NotifyAdminsWithPermission(notif model.AdminNotification, permission string) error {
	accounts, err := repo.getUserWithPermission(permission)
	if err != nil {
		return err
	}
	if len(accounts) == 0 {
		return nil
	}
	if err != nil{
		return err
	}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	notifId := ""
	err = transaction.Get(&notifId,"INSERT INTO messaging.notification(message)VALUES($1) RETURNING id", notif.Message)
	if err != nil {
		transaction.Rollback()
		return err
	}
	record := make([]goqu.Record, 0)
	dialect := goqu.Dialect("postgres")
	ds :=  dialect.Insert(goqu.T("admin_notification").Schema("messaging")).Prepared(true)
	for _, account := range accounts{
		routingKey := fmt.Sprintf("notify_admin_%s", account.Id)
		broadcasting.Broadcast("notification", routingKey, notif.Message)
		record = append(record,goqu.Record{
			"notification_id"  : notifId,
			"account_id": account.Id,
			"is_read": false,
			"link" : notif.Link,
		})
	}
	ds = ds.Rows(record)
	query, args, err := ds.ToSQL()
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err = transaction.Exec(query, args...)
	if err != nil {
		transaction.Rollback()
		return err
	}

	transaction.Commit()
	return nil
}

func (repo * Notification)GetAdminNotificationByAccountId(accountId string) ([]model.AdminNotification, error) {
	notifications := make([]model.AdminNotification, 0)
	err := repo.db.Select(&notifications,`SELECT admin_notification.id, account_id, notification_id, message, link, is_read from messaging.admin_notification
	INNER JOIN messaging.notification on notification_id = notification.id
	where account_id = $1 
	order by admin_notification.created_at desc`, accountId)
	return notifications, err
}

func (repo * Notification)MarkAdminNotificationsAsRead(accountId string) ( error) {
	_, err := repo.db.Exec("Update messaging.admin_notification set is_read = true where account_id = $1", accountId)
	return  err
}