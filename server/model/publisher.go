package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	validation "github.com/go-ozzo/ozzo-validation"
)

type Publisher struct {
	Id   string    `json:"id"`
	Name string `json:"name" db:"name"`
	Model
}

type PublishersJSON []struct {
	Publisher
}

func (instance *PublishersJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)

	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = make(PublishersJSON, 0)
		}
	} else {
		*instance = make(PublishersJSON, 0)
	}
	return nil

}
func (copy PublishersJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}

type PublisherJSON struct {
	Publisher
}

func (instance *PublisherJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = PublisherJSON{}
		}
	} else {
		*instance = PublisherJSON{}
	}
	return nil
}
func (publisher PublisherJSON) Value(value interface{}) (driver.Value, error) {
	return publisher, nil
}

func (m * Publisher) ValidateNew() (validation.Errors, error) {
	db := postgresdb.GetOrCreateInstance()
	return m.Model.Validate(m, 
		validation.Field(&m.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("invalid name")
				}
				isExists := true
			
				err := db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.publisher where name = $1 and deleted_at is null)", name)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("publisher already exists")
				}
				return nil
				
			}),

			))
}
func (m * Publisher) ValidateUpdate() (validation.Errors, error) {
	db := postgresdb.GetOrCreateInstance()
	return m.Model.Validate(m, 
		validation.Field(&m.Name, 
			validation.Required.Error("Name is required."), 
			validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters"),
			validation.By(func(value interface{}) error {
				name, isString := value.(string)
				
				if !isString {
					return errors.New("invalid name")
				}
				isExists := true
				
				err := db.Get(&isExists, "SELECT EXISTS(SELECT 1 FROM catalog.publisher where name = $1 and id  != $2 and deleted_at is null)", name, m.Id)
				
				if err != nil {
					return err
				}
				if isExists {
					return errors.New("publisher already exists")
				}
				return nil
			}),

			))
}

