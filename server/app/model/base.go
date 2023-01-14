package model

type Model[T any] struct {
	Id T `db:"id"`
}
