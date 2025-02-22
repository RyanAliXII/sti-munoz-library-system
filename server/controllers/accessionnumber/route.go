package accessionnumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func AccessionNumberRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewAccessionNumberController(services)
	router.GET("", services.PermissionValidator.Validate([]string{"Collection.Read"}, true), ctrler.GetAccessionNumbers)
	router.PUT("/:accession", 
	services.PermissionValidator.Validate([]string{"Collection.Edit"}, true),
	middlewares.ValidateBody[UpdateAccessionNumberBody], 
	ctrler.UpdateAccessionNumber)
}