package rabbitmq

import (
	"fmt"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

var USER = os.Getenv("RABBITMQ_DEFAULT_USER")
var PASSWORD = os.Getenv("RABBITMQ_DEFAULT_PASS")
var HOST = os.Getenv("RABBITMQ_HOST")
var PORT = os.Getenv("RABBITMQ_PORT")

var CONNECTION_STRING = fmt.Sprintf("amqp://%s:%s@%s:%s", USER, PASSWORD, HOST, PORT)

type RabbitMQ struct {
	Connection *amqp.Connection
	Channel    *amqp.Channel
}

func New() *RabbitMQ {
	connection, connectionErr := amqp.Dial(CONNECTION_STRING)
	if connectionErr != nil {
		panic(connectionErr.Error())
	}

	channel, channelErr := connection.Channel()

	if channelErr != nil {

		panic(channelErr.Error())
	}
	return &RabbitMQ{
		Connection: connection,
		Channel:    channel,
	}
}
