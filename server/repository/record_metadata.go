package repository

import (
	"sync"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
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


func (repo *RecordMetadataRepository) GetOrgAsAuthorMetadata(rowsLimit int) (Metadata, error) {
	if(recordMetaDataCache.OrgAsAuthor.IsValid){
		return recordMetaDataCache.OrgAsAuthor.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.organization where deleted_at is null`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetOrgAsAuthorMetadata"))
	}
	recordMetaDataCache.OrgAsAuthor.IsValid = true
	recordMetaDataCache.OrgAsAuthor.Metadata = meta
	return meta, getMetaErr
}

func (repo *RecordMetadataRepository) GetPublisherMetadata(rowsLimit int) (Metadata, error) {
	if(recordMetaDataCache.Publisher.IsValid){
		return recordMetaDataCache.Publisher.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.publisher where deleted_at is null`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetPublisherMetadata"))
	}
	recordMetaDataCache.Publisher.IsValid = true
	recordMetaDataCache.Publisher.Metadata = meta
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetAccountMetadata (rowsLimit int) (Metadata, error) {
	if(recordMetaDataCache.Account.IsValid){
		return recordMetaDataCache.Account.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM system.account`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetAccountMetadata"))
	}
	recordMetaDataCache.Account.IsValid = true
	recordMetaDataCache.Account.Metadata = meta
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetAccountSearchMetadata (filter * filter.Filter) (Metadata, error) {

	meta := Metadata{}
	query := `
			SELECT  CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records 
			FROM account_view where search_vector @@ (phraseto_tsquery('simple', $2) :: text || ':*' ) :: tsquery
		`
	getMetaErr := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetAccountMetadata"))
	}
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetDDCMetadata(rowsLimit int) (Metadata, error) {
	if(repo.recordMetadataCache.DDC.IsValid){
		return recordMetaDataCache.DDC.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.ddc`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetDDCMetadata"))
	}
	recordMetaDataCache.DDC.IsValid= true
	recordMetaDataCache.DDC.Metadata = meta
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetDDCSearchMetadata(filter * filter.Filter) (Metadata, error) {
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM catalog.ddc where search_vector @@ (websearch_to_tsquery('english', $2) :: text || ':*' ) :: tsquery`
	getMetaErr := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), slimlog.Error("getMetaErr"), slimlog.Function("RecordMetadataRepository.GetDDCMetadata"))
	}
	return meta, getMetaErr
}

func (repo *RecordMetadataRepository) InvalidatePersonAsAuthor() {
	recordMetaDataCache.PersonAsAuthor.IsValid = false
}
func (repo *RecordMetadataRepository) InvalidateOrgAsAuthor() {
	recordMetaDataCache.OrgAsAuthor.IsValid = false
}
func (repo *RecordMetadataRepository) InvalidatePublisher() {
	recordMetaDataCache.Publisher.IsValid = false
}
func (repo *RecordMetadataRepository) InvalidateAccount() {
	recordMetaDataCache.Account.IsValid = false
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
	OrgAsAuthor MetadataCache
	Publisher MetadataCache
	Account MetadataCache
	DDC MetadataCache
}

var once sync.Once
var recordMetaDataCache * RecordMetadataCache;
func newRecordMetadataCache () *RecordMetadataCache {
	once.Do(func() {
		recordMetaDataCache = &RecordMetadataCache{
			PersonAsAuthor: MetadataCache{IsValid: false, Metadata: Metadata{Records: 0, Pages: 0}},
			OrgAsAuthor: MetadataCache{IsValid: false, Metadata: Metadata{Records: 0, Pages: 0}},
			Publisher: MetadataCache{
				IsValid: false,
				Metadata: Metadata{
					Records: 0,
					Pages: 0,
				},
			},
			Account: MetadataCache{
				IsValid: false,
				Metadata: Metadata{
					Records: 0,
					Pages: 0,
				},
			},
		   DDC: MetadataCache {
				IsValid: false,
				Metadata: Metadata{
					Records: 0,
					Pages: 0,
				},
		   },

		}
	})
	return recordMetaDataCache
}
