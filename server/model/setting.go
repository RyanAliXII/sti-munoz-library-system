package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Settings struct{
	Value SettingsValue `json:"value" db:"value"`
}
type SettingsValue struct {
	DuePenalty SettingsFieldInt `json:"app.due-penalty"`
	MaxReservationPerDay SettingsFieldInt `json:"app.max-reservation" `
	DaysToDueDate SettingsFieldInt `json:"app.days-to-due-date"`
	AccountValidity SettingsFieldString `json:"app.account-validity"`
}
func(instance * SettingsValue)ToBytes() ([]byte, error) {
	bytes, err := json.Marshal(instance)
	return bytes, err
}
type SettingsFieldInt struct {
	Id string `json:"id"`
	Label string `json:"label"`
	Description string `json:"description"`
	Type string `json:"type"`
	DefaultValue int `json:"defaultValue"`
	Value int `json:"value"`

}
type SettingsFieldString struct {
	Id string `json:"id"`
	Label string `json:"label"`
	Description string `json:"description"`
	Type string `json:"type"`
	DefaultValue string `json:"defaultValue"`
	Value string `json:"value"`

}
func (settingsValue * SettingsValue) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := SettingsValue{
		DuePenalty: SettingsFieldInt{
			Label: "",
			Description: "",
			Value: 0,
		},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, settingsValue)
		if unmarshalErr != nil {
			*settingsValue = INITIAL_DATA_ON_ERROR
		}
	} else {
		*settingsValue = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (settingsValue SettingsValue) Value(value interface{}) (driver.Value, error) {
	return settingsValue, nil
}