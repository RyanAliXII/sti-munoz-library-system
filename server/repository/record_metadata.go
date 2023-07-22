package repository

import (
	"github.com/jmoiron/sqlx"
)


type RecordMetadataRepository struct  {
	db * sqlx.DB
	PersonAsAuthorCount int 

}

func (repo *RecordMetadataRepository) GetPersonAsAuthorMetadata(rowsLimit int) (Metadata, error) {
		meta := Metadata{}
        query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.author where deleted_at is null", tableName `
		getMetaErr := repo.db.Get(&meta, query, rowsLimit)
		return meta, getMetaErr
}






