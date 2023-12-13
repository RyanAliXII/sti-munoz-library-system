package model

type ExtrasContent struct {
	Id int `json:"id" db:""` 
	Value int `json:"value"`
}