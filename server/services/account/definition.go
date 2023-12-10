package account

import (
	"fmt"
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
)

type AccountBody struct {
	Id          string `json:"id" binding:"required,uuid"`
	DisplayName string `json:"displayName" binding:"required"`
	GivenName   string `json:"givenName" binding:"required"`
	Surname     string `json:"surname" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
}
type ProfilePictureBody struct{
	Image *multipart.FileHeader `form:"image" binding:"required"`
}
type AccountSlice struct {
	Accounts []model.Account `json:"accounts" validate:"required,dive"`
}

type SelectedAccountIdsBody struct{
	AccountIds []string `json:"accountIds"`
}
type AccountFilter struct {
	Disabled bool `form:"disabled"`
	Active bool `form:"active"`
	Deleted bool `form:"deleted"`
	filter.Filter
}
func( filter * AccountFilter) ExtractFilter(ctx  * gin.Context){
	filter.Filter.ExtractFilter(ctx)
	err := ctx.BindQuery(filter)
	if err != nil {
		fmt.Println(err.Error())
	}
}



type AccountsActivateBody struct {
	AccountIds []string `json:"accountIds"`
	ProgramId int  `json:"programId"`
	UserTypeId int  `json:"userTypeId"`
}