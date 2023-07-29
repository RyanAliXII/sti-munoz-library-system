package account

import "github.com/RyanAliXII/sti-munoz-library-system/server/model"

type AccountBody struct {
	Id          string `json:"id" binding:"required,uuid"`
	DisplayName string `json:"displayName" binding:"required"`
	GivenName   string `json:"givenName" binding:"required"`
	Surname     string `json:"surname" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
}



type AccountSlice struct {
	Accounts []model.Account `json:"accounts" validate:"required,dive"`
}