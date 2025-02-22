package repository

import (
	"sync"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/jmoiron/sqlx"
)



type RecordMetadataRepository struct  {
	db * sqlx.DB
	recordMetadataCache * RecordMetadataCache
	config RecordMetadataConfig
    
}

func (repo *RecordMetadataRepository) GetAuthorMetadata(rowsLimit int) (Metadata, error) {
		now := time.Now()	
		if(recordMetaDataCache.Author.IsValid && recordMetaDataCache.Author.ValidUntil.After(now)){
			return recordMetaDataCache.Author.Metadata, nil;
		}
		
		meta := Metadata{}
        query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.author where deleted_at is null`
		getMetaErr := repo.db.Get(&meta, query, rowsLimit)
		if getMetaErr == nil {
			recordMetaDataCache.Author.IsValid = true
			recordMetaDataCache.Author.Metadata = meta
			recordMetaDataCache.Author.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
		}
	
		return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetAuthorSearchMetadata(filter filter.Filter) (Metadata, error) {

	meta := Metadata{}
	query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.author where deleted_at is null and name ILIKE '%' || $2 || '%' `
	getMetaErr := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)

	return meta, getMetaErr
}

func (repo *RecordMetadataRepository) GetPublisherMetadata(rowsLimit int) (Metadata, error) {
	now := time.Now()
	if(recordMetaDataCache.Publisher.IsValid && recordMetaDataCache.Publisher.ValidUntil.After(now)){
		return recordMetaDataCache.Publisher.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.publisher where deleted_at is null`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr == nil {
		recordMetaDataCache.Publisher.IsValid = true
		recordMetaDataCache.Publisher.Metadata = meta
		recordMetaDataCache.Publisher.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
	}
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetPublisherSearchMetadata(filter filter.Filter) (Metadata, error) {
	meta := Metadata{}
	query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.publisher where deleted_at is null and name ILIKE '%' || $2 || '%' `
	getMetaErr := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)

	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetAccountMetadata (rowsLimit int) (Metadata, error) {
	now := time.Now()
	if(recordMetaDataCache.Account.IsValid && recordMetaDataCache.Account.ValidUntil.After(now)){
		return recordMetaDataCache.Account.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM system.account where deleted_at is null`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr == nil {
			recordMetaDataCache.Account.IsValid = true
			recordMetaDataCache.Account.Metadata = meta
			recordMetaDataCache.Account.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
	}
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetAccountSearchMetadata (filter * filter.Filter) (Metadata, error) {

	meta := Metadata{}
	query := `
			SELECT  
			CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, 
			count(1) as records 
			FROM 
			account_view 
			where (search_vector @@ (phraseto_tsquery('simple', $2) :: text) :: tsquery  
			OR 
			search_vector @@ (plainto_tsquery('simple', $2)::text) :: tsquery
			OR
			email ILIKE '%' || $2 || '%'
			OR 
			given_name ILIKE '%' || $2 || '%'
			OR
			surname ILIKE'%' || $2 || '%'
		   ) and deleted_at is null
		`
	getMetaErr := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), applog.Error("getMetaErr"), applog.Function("RecordMetadataRepository.GetAccountMetadata"))
	}
	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetDDCMetadata(rowsLimit int) (Metadata, error) {
	now :=time.Now()
	if(repo.recordMetadataCache.DDC.IsValid && recordMetaDataCache.DDC.ValidUntil.After(now)){
		return recordMetaDataCache.DDC.Metadata, nil;
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.ddc`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr == nil {
		recordMetaDataCache.DDC.IsValid= true
		recordMetaDataCache.DDC.Metadata = meta
		recordMetaDataCache.DDC.ValidUntil = time.Now().Add(repo.config.CacheExpiration)	
	}

	return meta, getMetaErr
}
func (repo *RecordMetadataRepository) GetDDCSearchMetadata(filter * filter.Filter) (Metadata, error) {
	meta := Metadata{}
    query := `
	SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.ddc where search_vector 
	@@   CASE
	WHEN length((websearch_to_tsquery('english', $2)::text)) > 0 THEN
			(websearch_to_tsquery('english', $2)::text || ':*')::tsquery
	ELSE
			websearch_to_tsquery('english', $2) :: tsquery
  	END  
  `
	getMetaErr := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	if getMetaErr != nil {
			logger.Error(getMetaErr.Error(), applog.Error("getMetaErr"), applog.Function("RecordMetadataRepository.GetDDCMetadata"))
	}
	return meta, getMetaErr
}
func(repo * RecordMetadataRepository)GetBookMetadata(rowsLimit int) (Metadata, error) {
	now := time.Now()

	if repo.recordMetadataCache.Book.IsValid && repo.recordMetadataCache.Account.ValidUntil.After(now){
		return repo.recordMetadataCache.Book.Metadata, nil
	}
	
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM book_view`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr == nil  {
		repo.recordMetadataCache.Book.Metadata = meta
		repo.recordMetadataCache.Book.IsValid = true
		repo.recordMetadataCache.Book.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
	}
	return meta, getMetaErr
}
func (repo * RecordMetadataRepository)GetBookSearchMetadata(filter filter.Filter)(Metadata, error){
	meta := Metadata{}
    query := `
	SELECT  CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records 
	FROM book_view WHERE search_vector @@ websearch_to_tsquery('english', $2) 
	OR search_vector @@ plainto_tsquery('simple', $2)
	OR search_tag_vector @@ websearch_to_tsquery('english', $2) 
	OR search_tag_vector @@ plainto_tsquery('simple', $2)
  	`
 	err := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	return meta, err
}

func (repo * RecordMetadataRepository)GetAccessionMetadata(rowsLimit int)(Metadata, error){
		now := time.Now()
		if repo.recordMetadataCache.Accession.IsValid && repo.recordMetadataCache.Accession.ValidUntil.After(now){
			return repo.recordMetadataCache.Accession.Metadata, nil
		}
		meta := Metadata{}
		query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.accession`
		err := repo.db.Get(&meta, query, rowsLimit)
		if err == nil  {
			repo.recordMetadataCache.Accession.Metadata = meta
			repo.recordMetadataCache.Accession.IsValid = true
			repo.recordMetadataCache.Accession.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
		}
		return meta, err
}
func (repo * RecordMetadataRepository)GetAccessionSearchMetadata(filter filter.Filter)(Metadata, error){
	meta := Metadata{}
	query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.accession 
	INNER JOIN book_view as book on accession.book_id = book.id where book.search_vector @@ websearch_to_tsquery('english', $2) 
	OR search_vector @@ plainto_tsquery('simple', $2)
	OR search_tag_vector @@ websearch_to_tsquery('english', $2) 
	OR search_tag_vector @@ plainto_tsquery('simple', $2)
	OR CAST(accession.number as TEXT) LIKE '%' || $2 || '%'
	`
	err := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	return meta, err
}
func (repo * RecordMetadataRepository) GetAuthorNumberMetadata(rowsLimit int) (Metadata, error) {
		now := time.Now()
		if repo.recordMetadataCache.AuthorNumber.IsValid && repo.recordMetadataCache.AuthorNumber.ValidUntil.After(now){
			return repo.recordMetadataCache.AuthorNumber.Metadata, nil
		}
		meta := Metadata{}
		query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.cutter_sanborn`
		err := repo.db.Get(&meta, query, rowsLimit)
		if err == nil  {
			repo.recordMetadataCache.AuthorNumber.Metadata = meta
			repo.recordMetadataCache.AuthorNumber.IsValid = true
			repo.recordMetadataCache.AuthorNumber.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
		}
		return meta, err
}
func (repo * RecordMetadataRepository) GetAuthorNumberSearchMetadata(filter filter.Filter) (Metadata, error) {
	meta := Metadata{}
	query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM catalog.cutter_sanborn where surname ILIKE '%' || $2 || '%' OR number ILIKE '%' || $2 || '%'`
	err := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	return meta, err
}

func(repo * RecordMetadataRepository)GetClientBookMetadata(rowsLimit int) (Metadata, error) {
	now := time.Now()

	if repo.recordMetadataCache.ClientBook.IsValid && repo.recordMetadataCache.ClientBook.ValidUntil.After(now){
		return repo.recordMetadataCache.ClientBook.Metadata, nil
	}
	meta := Metadata{}
    query := `SELECT CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records FROM client_book_view`
	getMetaErr := repo.db.Get(&meta, query, rowsLimit)
	if getMetaErr == nil  {
		repo.recordMetadataCache.ClientBook.Metadata = meta
		repo.recordMetadataCache.ClientBook.IsValid = true
		repo.recordMetadataCache.ClientBook.ValidUntil = time.Now().Add(repo.config.CacheExpiration)
	}
	return meta, getMetaErr
}
func (repo * RecordMetadataRepository)GetClientBookSearchMetadata(filter filter.Filter)(Metadata, error){
	meta := Metadata{}
    query := `
	SELECT  CASE WHEN COUNT(1) = 0 then 0 else CEIL((COUNT(1)/$1::numeric))::bigint end as pages, count(1) as records 
	FROM client_book_view WHERE search_vector @@ websearch_to_tsquery('english', $2) 
	OR search_vector @@ plainto_tsquery('simple', $2)
	OR search_tag_vector @@ websearch_to_tsquery('english', $2) 
	OR search_tag_vector @@ plainto_tsquery('simple', $2)
  	`
 	err := repo.db.Get(&meta, query, filter.Limit, filter.Keyword)
	return meta, err
}
func (repo *RecordMetadataRepository) InvalidateAuthor() {
	recordMetaDataCache.Author.IsValid = false
}
func (repo *RecordMetadataRepository) InvalidatePublisher() {
	recordMetaDataCache.Publisher.IsValid = false
}
func (repo *RecordMetadataRepository) InvalidateAccount() {
	recordMetaDataCache.Account.IsValid = false
}
func (repo * RecordMetadataRepository) InvalidateBook(){
	recordMetaDataCache.Book.IsValid = false
}
func(repo * RecordMetadataRepository) InvalidateAccession(){
	recordMetaDataCache.Accession.IsValid = false
}
func NewRecordMetadataRepository (db *sqlx.DB,  config RecordMetadataConfig) RecordMetadataRepository{
	return RecordMetadataRepository{
		db: db,
		recordMetadataCache: newRecordMetadataCache(config),
		config: config,
	}
}

type RecordMetadataConfig struct{
	CacheExpiration time.Duration 

}
type MetadataCache struct {
	IsValid bool 
	Metadata Metadata
	ValidUntil time.Time;
}

type RecordMetadataCache struct{
	Author MetadataCache
	Publisher MetadataCache
	Account MetadataCache
	DDC MetadataCache
	Book MetadataCache
	Accession MetadataCache
	AuthorNumber MetadataCache
	ClientBook MetadataCache
}

var once sync.Once
var recordMetaDataCache * RecordMetadataCache;
func newRecordMetadataCache (config  RecordMetadataConfig) *RecordMetadataCache {
	once.Do(func() {
		recordMetaDataCache = &RecordMetadataCache{
		       Author: MetadataCache{IsValid: false, 
				Metadata: Metadata{Records: 0, Pages: 0},
				ValidUntil: time.Now().Add(config.CacheExpiration),
			},
		
			Publisher: MetadataCache{
				IsValid: false,
				Metadata: Metadata{
					Records: 0,
					Pages: 0,
				},
				ValidUntil: time.Now().Add(config.CacheExpiration),
			},
			Account: MetadataCache{
				IsValid: false,
				Metadata: Metadata{
					Records: 0,
					Pages: 0,
				},
				ValidUntil: time.Now().Add(config.CacheExpiration),
			},
		   DDC: MetadataCache {
				IsValid: false,
				Metadata: Metadata{
					Records: 0,
					Pages: 0,
				},
				ValidUntil: time.Now().Add(config.CacheExpiration),
		   },
		  Book: MetadataCache{
			IsValid: false,
			Metadata: Metadata{
				Records: 0,
				Pages: 0,
			},
			ValidUntil: time.Now().Add(config.CacheExpiration),
		  },
		  ClientBook: MetadataCache{
			IsValid: false,
			Metadata: Metadata{
				Records: 0,
				Pages: 0,
			},
			ValidUntil: time.Now().Add(config.CacheExpiration),
		  },
		  Accession: MetadataCache{
			IsValid: false,
			Metadata: Metadata{
				Records: 0,
				Pages: 0,
			},
			ValidUntil:  time.Now().Add(config.CacheExpiration),
		  },
		  AuthorNumber: MetadataCache{
			IsValid: false,
			Metadata: Metadata{

			},
			ValidUntil: time.Now().Add(config.CacheExpiration),
		  },

		}
	})
	return recordMetaDataCache
}
