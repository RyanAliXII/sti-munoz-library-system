package printables

import "github.com/gin-gonic/gin"



func RegisterPrintablesRoutes(router * gin.RouterGroup){ 
	bookPrintalableCtrler := NewBookPrintableController()
	router.GET("/books/:id", bookPrintalableCtrler.GetBookPrintablesByBookId)

}