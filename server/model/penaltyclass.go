package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	validation "github.com/go-ozzo/ozzo-validation"
)

type PenaltyClassification struct {
	Id string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Amount float64 `json:"amount" db:"amount"`
	Description string 	`json:"description" db:"description"`
	Model
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
func (m * PenaltyClassification)ValidateNew() (validation.Errors, error) {
	db := postgresdb.GetOrCreateInstance()
	return m.Model.Validate(m, 
	validation.Field(&m.Name, validation.Required.Error("Name is required."), 
	validation.Length(1, 80).Error("Name should be alteast 1 to 80 characters"),
	validation.By(func(value interface{}) error {
		name, _ := value.(string)
		
		isExists := true

		err := db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM fee.penalty_classification where name = $1 and deleted_at is null)",  name)
		if err != nil {
			return err
		}
		if isExists {
			return errors.New("name already exists")
		}
		return nil
	})),
	validation.Field(&m.Description, 
	validation.Required.Error("Description is required."), 
	validation.Length(1, 255).Error("Description should be atleast 1 to 255 characters.")),
	)
}
func (m * PenaltyClassification)ValidateUpdate() (validation.Errors, error) {
	db := postgresdb.GetOrCreateInstance()
	return m.Model.Validate(m, 
	validation.Field(&m.Name, validation.Required.Error("Name is required."), 
	validation.Length(1, 80).Error("Name should be alteast 1 to 80 characters"),
	validation.By(func(value interface{}) error {
		name, _ := value.(string)
	
		isExists := true

		err := db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM fee.penalty_classification where name = $1 and id != $2  	and deleted_at is null)",  name, m.Id)
		if err != nil {
			return err
		}
		if isExists {
			return errors.New("name already exists")
		}
		return nil
	})),
	validation.Field(&m.Description, 
	validation.Required.Error("Description is required."), 
	validation.Length(1, 255).Error("Description should be atleast 1 to 255 characters.")),
	)
}