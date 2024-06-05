package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type AccessionNumberRepository interface {
	Get()([]model.AccessionNumber, error)
	Update(accessionNumber model.AccessionNumber)(error)
}

type AccessionNumber struct{
	db * sqlx.DB
}
func NewAccessionNumberRepository(db * sqlx.DB)AccessionNumberRepository{
	return &AccessionNumber{
		db: db,
	}
}
func (repo * AccessionNumber)Get()([]model.AccessionNumber, error){
	accessionNumbers := make([]model.AccessionNumber, 0)
	query := `SELECT accession, last_value, ARRAY_AGG(section.name) as collections FROM accession.counter 
	INNER JOIN catalog.section on counter.accession = section.accession_table
	GROUP BY accession, last_value ORDER BY accession DESC `
	err := repo.db.Select(&accessionNumbers, query)
	return accessionNumbers, err
}
func (repo * AccessionNumber)Update(accessionNumber model.AccessionNumber)(error){
	query := `UPDATE accession.counter set last_value = $1 where accession = $2`
	_, err := repo.db.Exec(query, accessionNumber.LastValue, accessionNumber.Accession )
	return err
}