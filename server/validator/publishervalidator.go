package validator

import (
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/jmoiron/sqlx"
)

type publisherValidator struct {
	db * sqlx.DB
}
func NewPublisherValidator(db * sqlx.DB) publisherValidator {
	return publisherValidator{
		db: db,
	}
}
func (v * publisherValidator) ValidateNew(publisher * model.Publisher) (validation.Errors, error) {
	err :=  validation.ValidateStruct(publisher, 
		validation.Field(&publisher.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("Invalid name")
				}
				isExists := true
			
				err := v.db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.publisher where name = $1 and deleted_at is null)", name)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("Publisher already exists")
				}
				return nil
				
			}),

			))
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
			return validationErrors, err
		}
	}
	return validation.Errors{}, nil
}
func (v * publisherValidator) ValidateUpdate(publisher * model.Publisher) (validation.Errors, error) {
	err := validation.ValidateStruct(publisher, 
		validation.Field(&publisher.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("invalid name")
				}
				isExists := true
				
				err := v.db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.publisher where name = $1 and id  != $2 and deleted_at is null)", name, publisher.Id)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("publisher already exists")
				}
				return nil
			}),

			))
		if err != nil {
			validationErrors, isValidationErr := err.(validation.Errors)
			if isValidationErr {
				return validationErrors, err
			}
		}
		return validation.Errors{}, nil
}

