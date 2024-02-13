package model

type Tree[T any] struct {
	Name string `json:"name"`
	Children  []*Tree[T] `json:"children"`
	Data T `json:"data"`
}