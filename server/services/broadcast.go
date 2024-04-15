package services

import (
	"context"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	"github.com/rabbitmq/amqp091-go"
)
type Broadcaster interface {
	Broadcast( exchange string, routingKey string, body []byte) error 
}
type RabbitMQBroadcast struct{
	mq * rabbitmq.RabbitMQ
}
func(b * RabbitMQBroadcast) Broadcast( exchange string, routingKey string, body []byte) error {	
	_, err := b.mq.Channel.QueueDeclare(
		"", // name
		false,   // durable
		false,   // delete when unused
		false,   // exclusive
		false,   // no-wait
		nil,     // arguments
	)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err = b.mq.Channel.PublishWithContext(ctx,
		exchange,     // exchange
		routingKey, // routing key
		false,  // mandatory
		false,  // immediate
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        body,
		})
	return err
}
func NewRabbitMQBroadcast(mq * rabbitmq.RabbitMQ) Broadcaster {
	return &RabbitMQBroadcast{
		mq: mq,
	}
}