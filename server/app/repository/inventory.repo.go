package repository

import (
	"fmt"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

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

func (repo *InventoryRepository) GetAuditedAccessionById(id string) []model.AuditedBook {

	var audited []model.AuditedBook
	query := `	SELECT 
	book.id  as id,
	title, isbn, 
	description, 
	copies,
	pages,
	section_id,  
	section.name as section,
	publisher.id as publisher_id,
	publisher.name as publisher,
	fund_source_id,
	source_of_fund.name as fund_source,
	cost_price,
	edition,
	year_published,
	received_at,
	ddc,
	author_number,
	find_audited_accesion_json(COALESCE(section.accession_table, 'default_accession'), book_id, audit_id) as accessions
	FROM inventory.audited_book  
	INNER JOIN catalog.book on audited_book.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	WHERE audited_book.audit_id = $1
	ORDER BY book.created_at DESC
	`
	selectErr := repo.db.Select(&audited, query, id)
	if selectErr != nil {
		logger.Info(selectErr.Error(), slimlog.Function("InventoryRepository.GetAuditedAccessionById"), slimlog.Error("selectErr"))
	}
	fmt.Println(audited)
	return audited
}
func NewInventoryRepository(db *sqlx.DB) InventoryRepositoryInterface {
	return &InventoryRepository{
		db: db,
	}

}

type InventoryRepositoryInterface interface {
	GetAudit() []model.Audit
	GetById(id string) model.Audit
	GetAuditedAccessionById(id string) []model.AuditedBook
}
