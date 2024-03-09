package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/jmoiron/sqlx"
)
type SearchTag struct {
	db * sqlx.DB
}
type SearchTagRepository interface{
	GetSearchTags() ([]string, error) 
}
func NewSearchTagRepository() SearchTagRepository {
	return &SearchTag{
		db: db.Connect(),
	}
}
func (repo * SearchTag)GetSearchTags() ([]string, error) {
	tags := make([]string, 0)
	err := repo.db.Select(&tags, "SELECT DISTINCT(name) as name FROM catalog.search_tag")
	return tags, err
}