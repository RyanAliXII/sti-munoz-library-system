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
}


type SettingsFieldInt struct {
	Id string `json:"id"`
	Label string `json:"label"`
	Description string `json:"description"`
	Value int `json:"value"`

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