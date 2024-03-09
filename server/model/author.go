package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	validation "github.com/go-ozzo/ozzo-validation"
)


type Author struct {
	Id    string    `json:"id" db:"id"`
	Name  string `json:"name" db:"name"`
	Model
}
func (m * Author) ValidateNew() (validation.Errors, error) {
	return m.Model.Validate(m, 
		validation.Field(&m.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 100).Error("Name should be atleast 1 to 100 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("invalid name")
				}
				isExists := true
				db := db.Connect()
				err := db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.author where name = $1 and deleted_at is null)", name)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("author already exists")
				}
				return nil
			}),

			))
}

func (m * Author) ValidateUpdate() (validation.Errors, error) {
	return m.Model.Validate(m, 
		validation.Field(&m.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 100).Error("Name should be atleast 1 to 100 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("invalid name")
				}
				isExists := true
				db := db.Connect()
				err := db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.author where name = $1 and id != $2  and deleted_at is null)", name, m.Id)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("author already exists")
				}
				return nil
			}),

			))
}


type AuthorsJSON []Author

func (instance *AuthorsJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AuthorsJSON{}
	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = INITIAL_DATA_ON_ERROR
		}
	} else {
		*instance = INITIAL_DATA_ON_ERROR
	}
	return nil
}
func (copy AuthorsJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}
