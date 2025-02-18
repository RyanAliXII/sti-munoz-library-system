package postgresdb

import (
	"fmt"
	"log"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"

	"github.com/jmoiron/sqlx"
)
func createConnection(config * configmanager.Config) *sqlx.DB {
	log.Println("Connecting to PostgreSQL Server")
	var driver = config.PostgreSQL.Driver
	var host = config.PostgreSQL.Host
	var port = config.PostgreSQL.Port
	var username = config.PostgreSQL.Username
	var password = config.PostgreSQL.Password
	var dbName = config.PostgreSQL.DBName
	connectionString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable application_name=library-server", host, port, username, password, dbName)
	var connection *sqlx.DB
	var lastErr error
	const retries = 10
	for i := 0; i < retries; i++ {

		tempConnection, connectErr := sqlx.Connect(driver, connectionString)
		if connectErr != nil {
			log.Printf("Error: %s, NextAction: Attempt to reconnect.", connectErr.Error())
			lastErr = connectErr
			time.Sleep(time.Second * 2)
			continue
		}
		connection = tempConnection
		lastErr = nil
		break
	}
	if lastErr != nil {

		panic(lastErr.Error())
	}
	log.Println("Successfully connected to PostgreSQL Server.")
	return connection
}
func New(config * configmanager.Config) *sqlx.DB {
	var db = createConnection(config)
	return db
}
