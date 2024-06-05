package repository

import "github.com/jmoiron/sqlx"

type AccessionNumberRepository interface {}

type AccessionNumber struct{
	db * sqlx.DB
}
func NewAccessionNumberRepository(db * sqlx.DB)AccessionNumberRepository{
	return AccessionNumber{
		db: db,
	}
}
func (repo * AccessionNumber)Get(){

}