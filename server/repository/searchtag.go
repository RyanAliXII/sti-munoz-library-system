package repository

import (
	"github.com/jmoiron/sqlx"
)
type SearchTag struct {
	db * sqlx.DB
}
type SearchTagRepository interface{
	GetSearchTags() ([]string, error) 
}
func NewSearchTagRepository(db * sqlx.DB) SearchTagRepository {
	return &SearchTag{
		db: db,
	}
}
func (repo * SearchTag)GetSearchTags() ([]string, error) {
	tags := make([]string, 0)
	err := repo.db.Select(&tags, "SELECT DISTINCT(name) as name FROM catalog.search_tag")
	return tags, err
}