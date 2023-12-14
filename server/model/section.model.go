package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	validation "github.com/go-ozzo/ozzo-validation"
)



type Section struct {
	Id              int    `json:"id" db:"id"`
	Name            string `json:"name" db:"name"`
	IsSubCollection bool   `json:"isSubCollection" db:"is_sub_collection"`
	Prefix 			string `json:"prefix" db:"prefix"`
	LastValue 		int `json:"lastValue" db:"last_value"`
	AccessionTable  string `json:"accessionTable" db:"accession_table"`
	MainCollectionId int `json:"mainCollectionId" db:"main_collection_id"`
	IsDeletable bool `json:"isDeleteable" db:"is_deleteable"`
	Model
}

func (section * Section) ValidateSection () (validation.Errors, error) {
		fieldsErrs, err :=  section.Model.Validate(section, 
			validation.Field(&section.Name, validation.Required.Error("Name is required."), 
			 validation.Length(1, 150).Error("Name should be atleast 1 to 150 characters."),
			 validation.By(func(value interface{}) error {
					name, isString  := value.(string)
					if !isString {
						return errors.New("invalid name")
					}

					db := db.Connect()
					isExists := true
					err := db.Get(&isExists, "SELECT EXISTS (SELECT name from catalog.section where name = $1)", name)
					if err != nil || isExists {
						return errors.New("collection name already exists")
					}
					return nil
			})),
			validation.Field(&section.Prefix, validation.Required.Error("Prefix is required.")),
		)
		return fieldsErrs, err
}
type SectionJSON struct {
	Section
}

func (section *SectionJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := SectionJSON{
		Section: Section{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, section)
		if unmarshalErr != nil {
			*section = INITIAL_DATA_ON_ERROR
		}
	} else {
		*section = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (section Section) Value(value interface{}) (driver.Value, error) {
	return section, nil
}
