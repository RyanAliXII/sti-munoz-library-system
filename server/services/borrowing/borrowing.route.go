package borrowing

import "github.com/gin-gonic/gin"


func BorrowingRoutes(r * gin.RouterGroup){
	ctrler := NewBorrowingController()
	r.POST("/",ctrler.HandleBorrowing)
	r.GET("/requests",ctrler.GetBorrowRequests)
	r.GET("/requests/:id", ctrler.GetBorrowedBooksByGroupId)
	r.PATCH("/borrowed-books/:id/status", ctrler.UpdateBorrowingStatus)
}