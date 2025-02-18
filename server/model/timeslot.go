package model

import (
	"encoding/json"
)

type TimeSlot struct {
	Id string `json:"id" db:"id"`
	StartTime string `json:"startTime" db:"start_time"`
	EndTime string `json:"endTime" db:"end_time"`
	ProfileId string `json:"profileId" db:"profile_id"`
	Booked int `json:"booked" db:"booked"`
}
type TimeSlotJSON struct{
	TimeSlot
}
func (instance *TimeSlotJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := TimeSlotJSON{
		TimeSlot: TimeSlot{},
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