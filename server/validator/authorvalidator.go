package validator

import (
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/jmoiron/sqlx"
)

type authorValidator struct{
	db * sqlx.DB
}
func NewAuthorValidator(db * sqlx.DB) authorValidator{
	return authorValidator{
		db: db,
	}
}
func (v * authorValidator) ValidateNew(author * model.Author) (validation.Errors, error) {
	err := validation.ValidateStruct(author, 
		validation.Field(&author.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 100).Error("Name should be atleast 1 to 100 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("Invalid name")
				}
				isExists := true
			
				err := v.db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.author where name = $1 and deleted_at is null)", name)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("Author already exists")
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

func (v * authorValidator) ValidateUpdate(author * model.Author) (validation.Errors, error) {
	err := validation.ValidateStruct(author, 
		validation.Field(&author.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 100).Error("Name should be atleast 1 to 100 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("Invalid name")
				}
				isExists := true
			
				err := v.db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.author where name = $1 and id != $2  and deleted_at is null)", name, author.Id)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("Author already exists")
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