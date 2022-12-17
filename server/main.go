package main

import (
	"fmt"
	"net/http"
	"os"

	"slim-app/server/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
)

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		panic(envErr.Error())
	}

	SPA_ADMIN := os.Getenv("SPA_ADMIN_URL")
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{SPA_ADMIN},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Hello from server",
		})
	})

	routes.RegisterV1(r)
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
