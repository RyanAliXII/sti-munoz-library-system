package model

type Section struct {
	Id              int    `json:"id" db:"id"`
	Name            string `json:"name" db:"name"`
	HasOwnAccession bool   `json:"hasOwnAccession" db:"own_accession"`
}
