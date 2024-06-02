package model

type ExtrasContent struct {
	Id int `json:"id" db:"id"` 
	Value string `json:"value" db:"value"`
}