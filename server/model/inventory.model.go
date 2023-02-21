package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Audit struct {
	Id   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type AuditedBook struct {
	Book
	Accession AuditedAccesions `json:"accessions" db:"accessions"`
}

type AuditedAccesions []struct {
	Number       int  `json:"number" db:"number"`
	CopyNumber   int  `json:"copyNumber" db:"copy_number"`
	IsAudited    bool `json:"isAudited" db:"is_audited"`
	IsCheckedOut bool `json:"isCheckedOut" db:"is_checked_out"`
}

func (aa *AuditedAccesions) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, aa)
		if unmarshalErr != nil {
			*aa = make(AuditedAccesions, 0)
		}

	} else {
		*aa = make(AuditedAccesions, 0)
	}
	return nil

}

func (aa AuditedAccesions) Value(value interface{}) (driver.Value, error) {
	return aa, nil
}
