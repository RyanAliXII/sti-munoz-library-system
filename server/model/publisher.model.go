package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Publisher struct {
	Id   int    `json:"id"`
	Name string `json:"name" db:"name"`
}
type PublisherJSON struct {
	Publisher
}

func (publisher *PublisherJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := PublisherJSON{
		Publisher: Publisher{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, publisher)
		if unmarshalErr != nil {
			*publisher = INITIAL_DATA_ON_ERROR
		}
	} else {
		*publisher = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (publisher PublisherJSON) Value(value interface{}) (driver.Value, error) {
	return publisher, nil
}
