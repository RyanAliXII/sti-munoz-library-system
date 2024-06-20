package model

import "encoding/json"

type Device struct {
	Id string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
}

type DeviceJSON struct{
	Device
}
func (instance *DeviceJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := DeviceJSON{
		Device: Device{},
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