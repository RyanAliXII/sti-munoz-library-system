package model

import "slim-app/server/app/db"

type Publisher struct {
	Id        int             `json:"id"`
	Name      string          `json:"name" db:"name"`
	DeletedAt db.NullableTime `json:"_" db:"deleted_at"`
}
