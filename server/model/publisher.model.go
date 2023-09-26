package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Publisher struct {
	Id   string    `json:"id"`
	Name string `json:"name" db:"name"`
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
