package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Section struct {
	Id              int    `json:"id" db:"id"`
	Name            string `json:"name" db:"name"`
	IsSubCollection bool   `json:"isSubCollection" db:"is_sub_collection"`
	Prefix 			string `json:"prefix" db:"prefix"`
	MainCollectionId int `json:"mainCollectionId" db:"main_collection_id"`
	IsDeletable bool `json:"isDeleteable" db:"is_deleteable"`
	IsNonCirculating bool `json:"isNonCirculating" db:"is_non_circulating"`
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
