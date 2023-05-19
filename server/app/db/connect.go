package db

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
)

func Connect() *sqlx.DB {

	DRIVER := os.Getenv("DB_DRIVER")
	HOST := os.Getenv("DB_HOST")
	PORT := os.Getenv("DB_PORT")
	USERNAME := os.Getenv("DB_USERNAME")
	PASSWORD := os.Getenv("DB_PASSWORD")
	DB_NAME := os.Getenv("DB_NAME")

	CONNECTION_STRING := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", HOST, PORT, USERNAME, PASSWORD, DB_NAME)
	connection, connectErr := sqlx.Connect(DRIVER, CONNECTION_STRING)

	if connectErr != nil {
		panic(connectErr.Error())
	}
	return connection
}
