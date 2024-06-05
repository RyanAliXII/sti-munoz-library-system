package accessionnumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


type AccessionNumberController interface {
	GetAccessionNumber(ctx * gin.Context)
}
type AccessionNumber struct {
	services * services.Services
}
func NewAccessionNumberController (services * services.Services) AccessionNumberController{
	return &AccessionNumber{
		services: services,
	}
}
func(ctrler * AccessionNumber)GetAccessionNumber(ctx * gin.Context){

}