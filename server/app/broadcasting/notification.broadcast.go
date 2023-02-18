package broadcasting

import (
	"context"
	"fmt"
	"slim-app/server/app/pkg/rabbitmq"
	"slim-app/server/app/pkg/slimlog"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type NotificationBroadcaster struct {
	rabbit  *rabbitmq.RabbitMQ
	message chan amqp.Delivery
}

func (broadcaster *NotificationBroadcaster) ListenByAccountId(accountId string, context context.Context) {
	exchangeErr := broadcaster.rabbit.Channel.ExchangeDeclare(
		"notification",      // name
		amqp.ExchangeDirect, // type
		true,                // durable
		false,               // auto-deleted
		false,               // internal
		false,               // no-wait
		nil,                 // arguments
	)
	if exchangeErr != nil {
		logger.Error(exchangeErr.Error(), slimlog.Function("NotificationRepository.ListenByAccountId"), slimlog.Error("exchangeErr"))
	}

	queue, queueErr := broadcaster.rabbit.Channel.QueueDeclare(
		"",    // queue name
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)

	if queueErr != nil {
		logger.Error(queueErr.Error(), slimlog.Function("NotificationRepository.ListenByAccountId"), slimlog.Error("queueErr"))

	}

	routingKey := fmt.Sprintf("notify_account_%s", accountId)
	bindErr := broadcaster.rabbit.Channel.QueueBind(
		queue.Name,     // queue name
		routingKey,     // routing key
		"notification", // exchange
		false,
		nil,
	)
	if bindErr != nil {
		logger.Error(bindErr.Error(), slimlog.Function("NotificationRepository.ListenByAccountId"), slimlog.Error("bindErr"))
	}

	messages, consumeErr := broadcaster.rabbit.Channel.Consume(
		queue.Name, // queue name
		"",         // consumer
		true,       // auto-ack
		false,      // exclusive
		false,      // no local
		false,      // no wait
		nil,        // arguments
	)
	if consumeErr != nil {
		logger.Error(consumeErr.Error(), slimlog.Function("NotificationRepository.Listen"), slimlog.Error("consumeErr"))

	}
	for {
		select {
		case <-context.Done():
			logger.Info("Notification listener has stopped.", zap.String("account", accountId))
			return
		case d := <-messages:
			logger.Info("New notification received.", zap.String("account", accountId))
			broadcaster.message <- d
		}
	}

}
func (broadcaster *NotificationBroadcaster) Message() <-chan amqp.Delivery {
	return broadcaster.message

}
func NewNotificationBroadcaster(rabbit *rabbitmq.RabbitMQ) NotificationBroadcasterInterface {
	return &NotificationBroadcaster{
		rabbit:  rabbit,
		message: make(chan amqp.Delivery),
	}
}

type NotificationBroadcasterInterface interface {
	ListenByAccountId(accountId string, context context.Context)
	Message() <-chan amqp.Delivery
}
