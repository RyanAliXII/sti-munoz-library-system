package repository

import (
	"fmt"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"
	"time"

	"github.com/jmoiron/sqlx"
)

type SectionRepository struct {
	db *sqlx.DB
}

func (repo *SectionRepository) New(section model.Section) error {

	const TABLE_PREFIX = "sec_"
	var tableName string
	if section.HasOwnAccession {
		t := time.Now().Unix()
		tableName = fmt.Sprint(TABLE_PREFIX, t)
		var query string = fmt.Sprintf(`
		CREATE TABLE accession.%s(
			id integer primary key generated always as identity,
			book_id uuid,
			copy_number int,
			created_at timestamptz DEFAULT NOW(),
			deleted_at timestamptz,
			FOREIGN KEY(book_id) REFERENCES catalog.book(id)
		)
	`, tableName)
		_, createErr := repo.db.Exec(query)
		if createErr != nil {
			logger.Error(createErr.Error(), slimlog.Function("SectionRepository.New"))
			return createErr
		}
		_, insertErr := repo.db.Exec("INSERT INTO catalog.section(name, accession_table)VALUES($1, $2)", section.Name, tableName)
		if insertErr != nil {
			logger.Error(insertErr.Error(), slimlog.Function("SectionRepository.New"))
		}
		return insertErr
	}
	_, insertErr := repo.db.Exec("INSERT INTO catalog.section(name)VALUES($1)", section.Name)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("SectionRepository.New"))
	}
	return nil
}
func (repo *SectionRepository) Get() []model.Section {
	var sections []model.Section = make([]model.Section, 0)
	selectErr := repo.db.Select(&sections, "SELECT id, name, (case when accession_table is NULL then false else true end) as has_own_accession from catalog.section ORDER BY created_at DESC")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("SectionRepository.Get"))
	}
	return sections
}
func (repo *SectionRepository) GetOne(id int) model.Section {
	var section model.Section

	return section
}
func NewSectionRepository(db *sqlx.DB) SectionRepositoryInterface {
	return &SectionRepository{
		db: db,
	}
}

type SectionRepositoryInterface interface {
	New(section model.Section) error
	Get() []model.Section
	GetOne(id int) model.Section
}
