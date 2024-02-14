package model

type Tree[IDT any, DataT any] struct {
	Id IDT `json:"id"`
	Name string `json:"name"`
	Children  []*Tree[IDT, DataT] `json:"children"`
	Data DataT `json:"data"`
}