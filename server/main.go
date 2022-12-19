package main

import (
	"net/http"
	"os"

	"slim-app/server/app/db"
	"slim-app/server/app/repository"
	"slim-app/server/controllers"
	"slim-app/server/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
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
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Hello from server",
		})
	})
	db := db.Connect()
	repos := repository.NewRepositories(db)
	v1Controller := controllers.RegisterV1(&repos)
	routes.RegisterV1(r, &v1Controller)
	r.Run(":5200")

}
