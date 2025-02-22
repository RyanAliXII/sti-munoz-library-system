package rabbitmq

import (
	"fmt"
	"log"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"

	amqp "github.com/rabbitmq/amqp091-go"
)


type RabbitMQ struct {
	Connection *amqp.Connection
	Channel    *amqp.Channel
}

func createConnection(config * configmanager.Config) *RabbitMQ {
	var connection *amqp.Connection
	var channel *amqp.Channel
	var lastError error
	const retries = 10
	var connectionString = fmt.Sprintf("amqp://%s:%s@%s:%s", config.RabbitMQ.User, config.RabbitMQ.Password, config.RabbitMQ.Host, config.RabbitMQ.Port)
	for i := 0; i < retries; i++ {
		log.Println("Connecting to RabbitMQ")
		tempConnection, connectionErr := amqp.Dial(connectionString)
		if connectionErr != nil {
			log.Printf("Error: %s, NextAction: Attempt to reconnect.", connectionErr.Error())
			lastError = connectionErr
			time.Sleep(time.Second * 2)
			continue
		}
		tempChannel, channelErr := tempConnection.Channel()
		if channelErr != nil {
			log.Printf("Error: %s, NextAction: Attempt to reconnect channel.", channelErr.Error())
			lastError = channelErr
			time.Sleep(time.Second * 2)
			continue
		}
		lastError = nil
		connection = tempConnection
		channel = tempChannel
		break
	}

	if lastError != nil {
		log.Println(lastError.Error())
		panic(lastError.Error())
	}
	log.Println("Successfully connected to RabbitMQ.")
	return &RabbitMQ{
		Connection: connection,
		Channel:    channel,
	}
}
func New(config * configmanager.Config) *RabbitMQ {
	var rabbitMQ = createConnection(config)
	return rabbitMQ
}
