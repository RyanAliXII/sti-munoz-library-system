package borrowing

import "github.com/gin-gonic/gin"


func BorrowingRoutes(r * gin.RouterGroup){
	ctrler := NewBorrowingController()
	r.POST("/",ctrler.HandleBorrowing)
}