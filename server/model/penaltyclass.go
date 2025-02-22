package model

import (
	"database/sql/driver"
	"encoding/json"
)

type PenaltyClassification struct {
	Id string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Amount float64 `json:"amount" db:"amount"`
	Description string 	`json:"description" db:"description"`
}

type PenaltyClassificationJSON struct {
	PenaltyClassification
}

func (instance *PenaltyClassificationJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := PenaltyClassificationJSON{
		PenaltyClassification: PenaltyClassification{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val,instance)
		if unmarshalErr != nil {
			*instance = INITIAL_DATA_ON_ERROR
		}
	} else {
		*instance = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (copy PenaltyClassification) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}