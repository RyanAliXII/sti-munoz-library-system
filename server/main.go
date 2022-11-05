package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

func main() {
	r := gin.New()
	r.Use(gin.Recovery())
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Hello from server",
		})
	})
	r.Run(":5200")
}

func InitDBConnection() *sqlx.DB {

	DB_DRIVER := os.Getenv("DB_DRIVER")
	DB_USERNAME := os.Getenv("DB_USERNAME")
	DB_PASSWORD := os.Getenv("DB_PASSWORD")
	DB_HOST := os.Getenv("DB_HOST")
	DB_PORT := os.Getenv("DB_PORT")

	CONNECTION_STRING := fmt.Sprintf("%s:%s@tcp(%s:%s)/?parseTime=true", DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT)
	fmt.Println(CONNECTION_STRING)
	connection, connectErr := sqlx.Open(DB_DRIVER, CONNECTION_STRING)
	if connectErr != nil {
		panic(connectErr.Error())
	}
	return connection
}
