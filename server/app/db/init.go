package db

import (
	"github.com/jmoiron/sqlx"
)

//ADD IF NOT EXISTS CLAUSE IF NEEDED
//CREATE YOUR OWN CUSTOM SCRIPT HERE TO CREATE DATABASE AND TABLE ON APPLICATION RUN
func InitDb(connection *sqlx.DB) {
	createAppDb(connection)
}

func createAppDb(connection *sqlx.DB) {
	// var DB_NAME string = os.Getenv("DB_NAME")
	// connection.MustExec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", DB_NAME))
	// connection.MustExec(fmt.Sprintf("USE %s", DB_NAME))

	// CREATE_USER_TABLE_QUERY := `
	// 		CREATE TABLE IF NOT EXISTS users (
	// 		id INT NOT NULL AUTO_INCREMENT,
	// 		firstname VARCHAR(100) NOT NULL,
	// 		lastname VARCHAR(100) NOT NULL,
	// 		email VARCHAR(100) NOT NULL,
	// 		password VARCHAR(100) NOT NULL,
	// 		PRIMARY KEY (id));
	// `
	// connection.MustExec(CREATE_USER_TABLE_QUERY)

}
