package model

type Section struct {
	Id              int    `json:"id" db:"id"`
	Name            string `json:"name" db:"name"`
	HasOwnAccession bool   `json:"hasOwnAccession" db:"has_own_accession"`
	AccessionTable  string `json:"accessionTable" db:"accession_table"`
}
