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
	if section.HasOwnAccession {
		t := time.Now().Unix()
		tableName = fmt.Sprint(TABLE_PREFIX, t)
		var query string = fmt.Sprintf(`
		CREATE TABLE accession.%s(
			id uuid primary key DEFAULT uuid_generate_v4(),
			number integer UNIQUE,
			book_id uuid,
			copy_number int,
			created_at timestamptz DEFAULT NOW(),
			deleted_at timestamptz,
			FOREIGN KEY(book_id) REFERENCES catalog.book(id)
		)
	`, tableName)
		_, createErr := transaction.Exec(query)
		if createErr != nil {
			transaction.Rollback()
			logger.Error(createErr.Error(), slimlog.Function("SectionRepository.New"))
			return createErr
		}
		_, insertErr := transaction.Exec("INSERT INTO catalog.section(name, accession_table)VALUES($1, $2)", section.Name, tableName)
		if insertErr != nil {
			transaction.Rollback()
			logger.Error(insertErr.Error(), slimlog.Function("SectionRepository.New"))
			return insertErr
		}
	} else {
		tableName = "accession_main"
		_, insertErr := transaction.Exec("INSERT INTO catalog.section(name, accession_table)VALUES($1,$2)", section.Name, tableName)
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
func (repo *SectionRepository) Get() []model.Section {
	var sections []model.Section = make([]model.Section, 0)
	selectErr := repo.db.Select(&sections, "SELECT id, name, (case when accession_table = 'accession_main' then false else true end) as has_own_accession from catalog.section ORDER BY created_at DESC")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("SectionRepository.Get"))
	}
	return sections
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
}
