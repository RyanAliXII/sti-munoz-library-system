package controllers

import (
	"slim-app/server/app/repository"
	controllers "slim-app/server/controllers/v1"
)

type ControllersV1 struct {
	CategoryController   controllers.CategoryControllerInterface
	AuthorController     controllers.AuthorControllerInterface
	FundSourceController *controllers.FundSourceController
}

func RegisterV1(repos *repository.Repositories) ControllersV1 {
	return ControllersV1{
		CategoryController:   &controllers.CategoryController{},
		AuthorController:     &controllers.AuthorController{Repos: repos},
		FundSourceController: &controllers.FundSourceController{},
	}
}
