package account

import (
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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