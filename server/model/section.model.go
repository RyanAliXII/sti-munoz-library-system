package model

import "slim-app/server/app/db"

type Section struct {
	Id              int               `json:"id" db:"id"`
	Name            string            `json:"name" db:"name"`
	HasOwnAccession bool              `json:"hasOwnAccession" db:"has_own_accession"`
	AccessionTable  db.NullableString `json:"ownAccession" db:"accession_table"`
}
