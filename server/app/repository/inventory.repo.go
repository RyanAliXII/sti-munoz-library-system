package repository

import (
	"fmt"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)

type InventoryRepository struct {
	db *sqlx.DB
}

func (repo *InventoryRepository) GetAudit() []model.Audit {
	query := "SELECT id, name FROM inventory.audit"
	var audit []model.Audit = make([]model.Audit, 0)

	selectErr := repo.db.Select(&audit, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("InventoryRepository.GetAudit"), slimlog.Error("selectErr"))
	}
	return audit
}
func (repo *InventoryRepository) GetById(id string) model.Audit {

	query := "SELECT id, name FROM inventory.audit where id = $1"
	var audit model.Audit = model.Audit{}

	selectErr := repo.db.Get(&audit, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("InventoryRepository.GetAudit"), slimlog.Error("selectErr"))
	}
	return audit
}

func (repo *InventoryRepository) GetAuditedAccessionById(id string) {
	var sections []model.Section = make([]model.Section, 0)
	selectSectionErr := repo.db.Select(&sections, "SELECT id, name, accession_table, (case when accession_table is NULL then false else true end) as has_own_accession from catalog.section")
	if selectSectionErr != nil {
		logger.Error(selectSectionErr.Error(), slimlog.Function("SectionRepository.Get"), slimlog.Error("selectSectionErr"))
	}

	dialect := goqu.Dialect("postgres")

	const DEFAULT_TABLE = "default_accession"
	var ds *goqu.SelectDataset
	const FIRST_LOOP = 0
	for i, section := range sections {
		var table string
		if section.HasOwnAccession {
			table = string(section.AccessionTable)
		} else {
			table = DEFAULT_TABLE
		}
		if i == FIRST_LOOP {
			ds = dialect.Select(goqu.C("id").Table(table).As("accession_number"), goqu.C("copy_number"), goqu.C("book_id"), goqu.C("title"),
				goqu.C("ddc"), goqu.C("author_number"), goqu.C("year_published"), goqu.C("created_at").Table("book"), goqu.L("?", section.Name).As("section"), goqu.L("?", section.Id).As("section_id")).From(goqu.T(table).Schema("accession")).Where(goqu.Ex{
				"book.section_id": section.Id,
			}).InnerJoin(goqu.I("catalog.book"),
				goqu.On((goqu.Ex{"book_id": goqu.I("book.id")})))
		} else {
			ds = ds.Union(goqu.Select(goqu.C("id").Table(table).As("accession_number"), goqu.C("copy_number"), goqu.C("book_id"), goqu.C("title"),
				goqu.C("ddc"), goqu.C("author_number"), goqu.C("year_published"), goqu.C("created_at").Table("book"), goqu.L("?", section.Name).As("section"), goqu.L("?", section.Id).As("section_id")).From(goqu.T(table).Schema("accession")).Where(goqu.Ex{
				"book.section_id": section.Id,
			}).InnerJoin(goqu.I("catalog.book"),
				goqu.On((goqu.Ex{"book_id": goqu.I("book.id")}))))
		}
		fmt.Println(ds)
	}

	// finalDs := dialect.From(ds).Order(goqu.I("created_at").Desc())
}
func NewInventoryRepository(db *sqlx.DB) InventoryRepositoryInterface {
	return &InventoryRepository{
		db: db,
	}

}

type InventoryRepositoryInterface interface {
	GetAudit() []model.Audit
	GetById(id string) model.Audit
	GetAuditedAccessionById(id string)
}
