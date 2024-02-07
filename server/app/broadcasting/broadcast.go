package broadcasting

import (
	"context"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	"github.com/rabbitmq/amqp091-go"
)

func Broadcast( exchange string, routingKey string, body string) error {
	rabbit := rabbitmq.CreateOrGetInstance()	
	_, err := rabbit.Channel.QueueDeclare(
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

	
	err = rabbit.Channel.PublishWithContext(ctx,
		exchange,     // exchange
		routingKey, // routing key
		false,  // mandatory
		false,  // immediate
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        []byte(body),
		})
	return err
}