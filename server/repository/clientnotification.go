package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
)



func(repo * Notification)NotifyClient(notif model.ClientNotification) error {

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
	
	_, err = transaction.Exec("INSERT INTO messaging.client_notification(notification_id, account_id, is_read, link) VALUES($1, $2, $3, $4)", 
	notifId, notif.AccountId, notif.IsRead, notif.Link)
	if err != nil {
		transaction.Rollback()
		return err
	}
	
	transaction.Commit()
	return nil
}

func (repo * Notification)GetClientNotificationByAccountId(accountId string) ([]model.ClientNotification, error) {
	notifications := make([]model.ClientNotification, 0)
	err := repo.db.Select(&notifications,`SELECT client_notification.id, account_id, notification_id, message, link, is_read, client_notification.created_at from messaging.client_notification
	INNER JOIN messaging.notification on notification_id = notification.id
	where account_id = $1 
	order by client_notification.created_at desc`, accountId)
	return notifications, err
}
func (repo * Notification)MarkClientNotificationsAsRead(accountId string) ( error) {
	_, err := repo.db.Exec("Update messaging.client_notification set is_read = true where account_id = $1", accountId)
	return  err
}