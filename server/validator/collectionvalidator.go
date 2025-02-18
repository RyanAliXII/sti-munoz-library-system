package validator

import (
	"errors"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/jmoiron/sqlx"
)

type collectionValidator struct {
	db* sqlx.DB
}
func NewCollectionValidator(db* sqlx.DB) collectionValidator{
	return  collectionValidator{
		db: db,
	}
}
func (v * collectionValidator) ValidateNew(collection * model.Section) (validation.Errors, error) {

	err :=  validation.ValidateStruct(collection, 
		validation.Field(&collection.Name, validation.Required.Error("Name is required."), 
		validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters."),
		validation.By(func(value interface{}) error {
				name, isString  := value.(string)
				if !isString {
					return errors.New("invalid name")
				}

				
				isExists := true
				err := v.db.Get(&isExists, "SELECT EXISTS (SELECT name from catalog.section where name = $1  and deleted_at is null)", name)
				if err != nil{
					return err
				}
				if isExists {
					return fmt.Errorf("collection name already exists")
				}
				return nil
		})),
		validation.Field(&collection.Prefix, validation.Required.Error("Prefix is required."),validation.Length(1, 6).Error("Prefix should be atleast 1 to 6 characters."),),
	)
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
			return validationErrors, err
		}
	}
	return validation.Errors{}, nil
}
func (v * collectionValidator) ValidateUpdate(collection * model.Section) (validation.Errors, error){
	err :=  validation.ValidateStruct(collection, 
	validation.Field(&collection.Name, validation.Required.Error("Name is required."), 
	validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters."),
	validation.By(func(value interface{}) error {
			name, isString  := value.(string)
			if !isString {
				return errors.New("invalid name")
			}
		
			isExists := true
			err := v.db.Get(&isExists, "SELECT EXISTS (SELECT name from catalog.section where name = $1 and id != $2 and deleted_at is null)", name, collection.Id)
			if err != nil  {
				return err
			}
			if isExists {
				return fmt.Errorf("collection name already exists")
			}
			return nil
	})),
	validation.Field(&collection.Prefix, validation.Required.Error("Prefix is required."),validation.Length(1, 6).Error("Prefix should be atleast 1 to 6 characters."),),
	)	
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
			return validationErrors, err
		}
	}
	return validation.Errors{}, nil

}