package model

import "github.com/lib/pq"

type AccessionNumber struct{
	Accession string `json:"accession" db:"accession"`
	LastValue string `json:"lastValue" db:"last_value"`
	Collections pq.StringArray `json:"collections" db:"collections"`
}