package broadcasting

import "slim-app/server/app/pkg/rabbitmq"

type Broadcasters struct {
	NotificationBroadcaster NotificationBroadcasterInterface
}

func NewBroadcasters() Broadcasters {
	rabbitmq := rabbitmq.New()
	return Broadcasters{
		NotificationBroadcaster: NewNotificationBroadcaster(rabbitmq),
	}
}
