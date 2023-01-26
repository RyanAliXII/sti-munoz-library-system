package model

type Audit struct {
	Id   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}
