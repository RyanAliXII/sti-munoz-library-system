package repository

import (
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
)

type SectionRepository struct {
	db *sqlx.DB
}

func (repo *SectionRepository) New(section model.Section) error {
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		logger.Error(transactErr.Error(), slimlog.Function("SectionRepository.New"))
		return transactErr
	}
	const TABLE_PREFIX = "accession_"
	var tableName string

	if section.MainCollectionId == 0 {
		t := time.Now().Unix()
		tableName = fmt.Sprint(TABLE_PREFIX, t)
		_, insertErr := transaction.Exec("INSERT INTO catalog.section(name, accession_table, prefix)VALUES($1, $2, $3)", section.Name, tableName, section.Prefix)
		if insertErr != nil {
			transaction.Rollback()
			logger.Error(insertErr.Error(), slimlog.Function("SectionRepository.New"))
			return insertErr
		}
	} else {
		collection := model.Section{}
		err := transaction.Get(&collection, "SELECT id, name, accession_table from catalog.section where id = $1 and main_collection_id is null LIMIT 1", section.MainCollectionId)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetCollectionErr"))
			transaction.Rollback()
			return err
		}
		tableName := collection.AccessionTable
		_, insertErr := transaction.Exec("INSERT INTO catalog.section(name, accession_table, prefix, main_collection_id)VALUES($1,$2,$3,$4)", section.Name, tableName, section.Prefix, section.MainCollectionId)
		if insertErr != nil {
			transaction.Rollback()
			logger.Error(insertErr.Error(), slimlog.Function("SectionRepository.New"), slimlog.Error("insertErr"))
			return insertErr
		}
	}

	_, createCounterErr := transaction.Exec("INSERT into accession.counter(accession) VALUES($1) ON CONFLICT (accession) DO NOTHING", tableName)
	if createCounterErr != nil {
		transaction.Rollback()
		logger.Error(createCounterErr.Error(), slimlog.Function("SectionRepository.New"), slimlog.Error("createCounterErr"))
		return createCounterErr
	}
	transaction.Commit()
	return nil
}
func (repo * SectionRepository)Update(section model.Section) error {
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}	
	accessionCounter := ""
	err = transaction.Get(&accessionCounter, "SELECT accession_table from catalog.section where id = $1", section.Id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err  = transaction.Exec("UPDATE accession.counter set last_value = $1 where accession = $2", section.LastValue, accessionCounter)
	if err != nil {
		transaction.Rollback()
		return err
	}
	_, err  = transaction.Exec("UPDATE catalog.section set name= $1, prefix = $2 where id = $3", section.Name, section.Prefix, section.Id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil;
}
func (repo *SectionRepository) Get() []model.Section {
	var sections []model.Section = make([]model.Section, 0)
	selectErr := repo.db.Select(&sections, `
	SELECT section.id, 
	name,
	prefix,
	(case when (count(book.id) > 0) then false else true end) is_deleteable,
	(case when main_collection_id is null then false else true end) 
	as is_sub_collection, last_value from catalog.section 
	inner join accession.counter on accession_table = counter.accession
	LEFT join catalog.book on section.id = book.section_id
	GROUP BY section.id, last_value ORDER BY section.created_at DESC`)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("SectionRepository.Get"))
	}
	return sections
}
func (repo *SectionRepository)GetMainCollections()([]model.Section, error){
	var sections []model.Section = make([]model.Section, 0)
	selectErr := repo.db.Select(&sections, `
	SELECT section.id, 
	name,
	prefix,
	(case when (count(book.id) > 0) then false else true end) is_deletable,
	(case when main_collection_id is null then false else true end) 
	as is_sub_collection, last_value from catalog.section 
	inner join accession.counter on accession_table = counter.accession
	LEFT join catalog.book on section.id = book.section_id
	where main_collection_id is null
	GROUP BY section.id, last_value ORDER BY section.created_at DESC`)
	return sections, selectErr
}
func (repo *SectionRepository) GetOne(id int) model.Section {
	var section model.Section

	return section
}
func NewSectionRepository() SectionRepositoryInterface {
	return &SectionRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type SectionRepositoryInterface interface {
	New(section model.Section) error
	Get() []model.Section
	GetOne(id int) model.Section
	Update(section model.Section) error
	GetMainCollections()([]model.Section, error )
}
