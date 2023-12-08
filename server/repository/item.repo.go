package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)



type Item struct {
	db * sqlx.DB
}
func NewItemRepository () ItemRepository {
	return &Item{
		db: db.Connect(),
	}
}
type ItemRepository interface {
	SearchItems(*filter.Filter)([]model.Item, error)
}

func (repo * Item)SearchItems(filter * filter.Filter)([]model.Item, error){
	items := make([]model.Item, 0)
	query := `SELECT * FROM item_view
	WHERE search_vector @@ websearch_to_tsquery('english', $1) 
	OR search_vector @@ plainto_tsquery('simple', $1) 
	OR name ILIKE '%' || $1 || '%'
	OR description ILIKE '%' || $1 || '%'
	LIMIT $2
	`
	err := repo.db.Select(&items, query, filter.Keyword, filter.Limit)
	return items, err
}
