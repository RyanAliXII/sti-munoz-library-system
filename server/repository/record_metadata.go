package repository

import (
	"sync"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/jmoiron/sqlx"
)



type RecordMetadataRepository struct  {
	db * sqlx.DB
	recordMetadataCache * RecordMetadataCache

}

func (repo *RecordMetadataRepository) GetPersonAsAuthorMetadata(rowsLimit int) (Metadata, error) {
		if(recordMetaDataCache.PersonAsAuthor.IsValid){
			return recordMetaDataCache.PersonAsAuthor.Metadata, nil;
		}
		meta := Metadata{}
        query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.author where deleted_at is null`
		getMetaErr := repo.db.Get(&meta, query, rowsLimit)
		if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetPersonAsAuthorMetadata"))
		}
		recordMetaDataCache.PersonAsAuthor.IsValid = true
		recordMetaDataCache.PersonAsAuthor.Metadata = meta
		return meta, getMetaErr
}
func (repo *RecordMetadataRepository) InvalidatePersonAsAuthor() {
	recordMetaDataCache.PersonAsAuthor.IsValid = false
}

func NewRecordMetadataRepository () RecordMetadataRepository{
	db := postgresdb.GetOrCreateInstance()
	return RecordMetadataRepository{
		db: db,
		recordMetadataCache: newRecordMetadataCache(),
	}
}

type MetadataCache struct {
	IsValid bool 
	Metadata Metadata
}

type RecordMetadataCache struct{
	PersonAsAuthor MetadataCache
}

var once sync.Once
var recordMetaDataCache * RecordMetadataCache;
func newRecordMetadataCache () *RecordMetadataCache {
	once.Do(func() {
		recordMetaDataCache = &RecordMetadataCache{
			PersonAsAuthor: MetadataCache{IsValid: false, Metadata: Metadata{Records: 0, Pages: 0}},
		}
	})
	return recordMetaDataCache
}
