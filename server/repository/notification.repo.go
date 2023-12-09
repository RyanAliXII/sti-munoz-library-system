package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
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
	NotifyBookBorrowingAdminPending () error
}