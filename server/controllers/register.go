package controllers

import controllers "slim-app/server/controllers/1"

type ControllersV1 struct {
	CategoryController *controllers.CategoryController
	AuthorController   *controllers.AuthorController
}

func RegisterV1() ControllersV1 {
	return ControllersV1{
		CategoryController: &controllers.CategoryController{},
		AuthorController:   &controllers.AuthorController{},
	}
}
