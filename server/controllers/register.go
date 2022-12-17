package controllers

import controllers "slim-app/server/controllers/v1"

type ControllersV1 struct {
	CategoryController   *controllers.CategoryController
	AuthorController     *controllers.AuthorController
	FundSourceController *controllers.FundSourceController
}

func RegisterV1() ControllersV1 {
	return ControllersV1{
		CategoryController:   &controllers.CategoryController{},
		AuthorController:     &controllers.AuthorController{},
		FundSourceController: &controllers.FundSourceController{},
	}
}
