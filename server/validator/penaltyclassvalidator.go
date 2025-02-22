package validator

import (
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/jmoiron/sqlx"
)

type penaltyClassValidator struct{
	db *sqlx.DB		
}
func NewPenaltyClassValidator(db *sqlx.DB) penaltyClassValidator{
	return penaltyClassValidator{
		db: db,
	}
}
func (v * penaltyClassValidator)ValidateNew(m * model.PenaltyClassification) (validation.Errors, error) {
	err := validation.ValidateStruct(m, 
	validation.Field(&m.Name, validation.Required.Error("Name is required."), 
	validation.Length(1, 80).Error("Name should be alteast 1 to 80 characters"),
	validation.By(func(value interface{}) error {
		name, _ := value.(string)
		
		isExists := true

		err := v.db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM fee.penalty_classification where name = $1 and deleted_at is null)",  name)
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
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
			return validationErrors, err
		}
	}
	return validation.Errors{}, nil
}
func (v * penaltyClassValidator)ValidateUpdate(m * model.PenaltyClassification) (validation.Errors, error) {
	err := validation.ValidateStruct(m, 
	validation.Field(&m.Name, validation.Required.Error("Name is required."), 
	validation.Length(1, 80).Error("Name should be alteast 1 to 80 characters"),
	validation.By(func(value interface{}) error {
		name, _ := value.(string)
		isExists := true
		err := v.db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM fee.penalty_classification where name = $1 and id != $2 and deleted_at is null)",  name, m.Id)
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
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
			return validationErrors, err
		}
	}
	return validation.Errors{}, nil
}