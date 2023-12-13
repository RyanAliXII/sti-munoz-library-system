package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type Extras struct {
	db  * sqlx.DB
}
type ExtrasRepository interface{
	UpdateFAQsContent(content model.ExtrasContent) error 
	GetFAQsContent() (model.ExtrasContent,error)
}
func NewExtrasRepository() ExtrasRepository{
	return &Extras{
		db: db.Connect(),
	}
}
func (repo * Extras)UpdateFAQsContent(content model.ExtrasContent) error {
	_, err := repo.db.Exec("UPDATE system.extras SET value = $1 where id = 1", content.Value)
	return err
}
func (repo * Extras)GetFAQsContent() (model.ExtrasContent,error) {
	content := model.ExtrasContent{}
	err := repo.db.Get(&content, "SELECT id, value from system.extras where id = 1")
	return content, err
	
}