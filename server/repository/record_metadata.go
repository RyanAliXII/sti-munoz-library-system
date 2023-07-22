package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/jmoiron/sqlx"
)






type RecordMetadataCache struct{
	
}


type RecordMetadataRepository struct  {
	db * sqlx.DB
	

}

func (repo *RecordMetadataRepository) GetPersonAsAuthorMetadata(rowsLimit int) (Metadata, error) {
		meta := Metadata{}
        query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.author where deleted_at is null`
		getMetaErr := repo.db.Get(&meta, query, rowsLimit)
		return meta, getMetaErr
}


func NewRecordMetadataRepository () RecordMetadataRepository{
	db := postgresdb.GetOrCreateInstance()
	return RecordMetadataRepository{
		db: db,
	}
}

