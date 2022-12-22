package model

type Publisher struct {
	Id        int            `json:"id"`
	Name      string         `json:"name" db:"name"`
	DeletedAt NullTimeCustom `json:"deletedAt" db:"deleted_at"`
	CreatedAt NullTimeCustom `json:"createdAt" db:"created_at"`
}
