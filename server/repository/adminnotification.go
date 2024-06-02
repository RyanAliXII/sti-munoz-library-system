package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
)

type AccountIds []string

func(repo * Notification)NotifyAdminsWithPermission(notif model.AdminNotification, permission string)(AccountIds,  error) {
	accountIds := AccountIds{}
	accounts, err := repo.getUserWithPermission(permission)
	if err != nil {
		return accountIds, err
	}
	if len(accounts) == 0 {
		return accountIds, err
	}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return accountIds,err
	}
	notifId := ""
	err = transaction.Get(&notifId,"INSERT INTO messaging.notification(message)VALUES($1) RETURNING id", notif.Message)
	if err != nil {
		transaction.Rollback()
		return accountIds,err
	}
	record := make([]goqu.Record, 0)
	dialect := goqu.Dialect("postgres")
	
	ds :=  dialect.Insert(goqu.T("admin_notification").Schema("messaging")).Prepared(true)
	for _, account := range accounts{
	
		accountIds = append(accountIds, account.Id)
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
		return accountIds,err
	}
	_, err = transaction.Exec(query, args...)
	if err != nil {
		transaction.Rollback()
		return accountIds, err
	}

	transaction.Commit()
	return accountIds, nil
}

func (repo * Notification)GetAdminNotificationByAccountId(accountId string) ([]model.AdminNotification, error) {
	notifications := make([]model.AdminNotification, 0)
	err := repo.db.Select(&notifications,`SELECT admin_notification.id, account_id, notification_id, message, link, is_read, admin_notification.created_at from messaging.admin_notification
	INNER JOIN messaging.notification on notification_id = notification.id
	where account_id = $1 
	order by admin_notification.created_at desc`, accountId)
	return notifications, err
}

func (repo * Notification)MarkAdminNotificationsAsRead(accountId string) ( error) {
	_, err := repo.db.Exec("Update messaging.admin_notification set is_read = true where account_id = $1", accountId)
	return  err
}