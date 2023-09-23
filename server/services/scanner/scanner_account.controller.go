package scanner

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)






type ScannerAccountController interface{
	NewAccount(ctx * gin.Context)
}
type ScannerAccount struct{} 

func(ScannerAccount* ScannerAccount) NewAccount(ctx * gin.Context ){
	body := model.ScannerAccount{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	fmt.Println(body)


}


func NewScannerAccountController()ScannerAccountController{
	return &ScannerAccount{}
}