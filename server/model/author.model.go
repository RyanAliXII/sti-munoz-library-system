package model

import (
	"database/sql/driver"
	"encoding/json"
)

type PersonAsAuthor struct {
	Id         int    `json:"id" db:"id"`
	GivenName  string `json:"givenName" db:"given_name"`
	MiddleName string `json:"middleName" db:"middle_name"`
	Surname    string `json:"surname" db:"surname"`
}
type Author struct {
	Id         int    `json:"id" db:"id"`
	Name  string `json:"name" db:"name"`
}
type OrgAsAuthor struct {
	Id   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type AuthorsJSON struct {
	People        PeopleAsAuthorJSON `db:"people" json:"people"`
	Organizations OrgsAsAuthorJSON   `db:"organization" json:"organizations"`
	Publishers    PublishersJSON     `db:"publishers" json:"publishers"`
}

func (instance *AuthorsJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AuthorsJSON{
		People:        make(PeopleAsAuthorJSON, 0),
		Organizations: make(OrgsAsAuthorJSON, 0),
		Publishers:    make(PublishersJSON, 0),
	}
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

type PeopleAsAuthorJSON []struct {
	PersonAsAuthor
}

func (instance *PeopleAsAuthorJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)

	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = make(PeopleAsAuthorJSON, 0)
		}
	} else {
		*instance = make(PeopleAsAuthorJSON, 0)
	}
	return nil

}
func (copy PeopleAsAuthorJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}

type OrgsAsAuthorJSON []struct {
	Id   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

func (instance *OrgsAsAuthorJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)

	if valid {
		unmarshalErr := json.Unmarshal(val, instance)
		if unmarshalErr != nil {
			*instance = make(OrgsAsAuthorJSON, 0)
		}
	} else {
		*instance = make(OrgsAsAuthorJSON, 0)
	}
	return nil

}
func (copy OrgsAsAuthorJSON) Value(value interface{}) (driver.Value, error) {
	return copy, nil
}
