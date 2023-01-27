package repository

import (
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type InventoryRepository struct {
	db *sqlx.DB
}

func (repo *InventoryRepository) GetAudit() []model.Audit {
	query := "SELECT id, name FROM inventory.audit ORDER BY created_at DESC"
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
	return audited
}
func (repo *InventoryRepository) AddToAudit(id string, bookId string, accessionId int) error {

	const UNIQUE_VIOLATION_ERROR = "unique_violation"
	insertBookToAuditQuery := `INSERT INTO inventory.audited_book(book_id, audit_id) VALUES ($1,$2)`
	_, insertBookToAuditErr := repo.db.Exec(insertBookToAuditQuery, bookId, id)

	if insertBookToAuditErr != nil {
		err, ok := insertBookToAuditErr.(*pq.Error)

		if !ok {

			logger.Error(insertBookToAuditErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertBookToAuditErr"))
			return insertBookToAuditErr
		}
		if err.Code.Name() != UNIQUE_VIOLATION_ERROR {

			logger.Error(insertBookToAuditErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertBookToAuditErr"))
			return insertBookToAuditErr
		}

		logger.Info("Book Already scanned, proceeding to insert accession.", slimlog.Function("InventoryRepository.AddToAudit"))
	}
	insertAccessionToAudit := `INSERT INTO inventory.audited_accession(book_id, audit_id, accession_id) VALUES ($1,$2,$3)`
	_, insertAccessionToAuditErr := repo.db.Exec(insertAccessionToAudit, bookId, id, accessionId)

	if insertAccessionToAuditErr != nil {
		err, ok := insertAccessionToAuditErr.(*pq.Error)
		if !ok {
			logger.Error(insertAccessionToAuditErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertAccessionToAuditErr"))
			return insertBookToAuditErr
		}

		if err.Code.Name() != UNIQUE_VIOLATION_ERROR {
			logger.Error(insertAccessionToAuditErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertAccessionToAuditErr"))
			return insertBookToAuditErr
		}
		logger.Info("Accession Already scanned.", slimlog.Function("InventoryRepository.AddToAudit"))

		return nil
	}

	return nil
}
func (repo *InventoryRepository) NewAudit(audit model.Audit) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO inventory.audit(name)VALUES(:name)", audit)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("InventoryRepository.NewAudit"), slimlog.Error("insertErr"))
	}
	return insertErr
}
func (repo *InventoryRepository) UpdateAudit(audit model.Audit) error {
	_, updateErr := repo.db.Exec("UPDATE inventory.audit SET name = $1 WHERE id = $2", audit.Name, audit.Id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("InventoryRepository.UpdateAudit"), slimlog.Error("updateErr"))
	}
	return updateErr
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
	AddToAudit(id string, bookId string, accession int) error
	NewAudit(audit model.Audit) error
	UpdateAudit(audit model.Audit) error
}
