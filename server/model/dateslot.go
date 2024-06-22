package model

import (
	"encoding/json"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type DateSlot struct {
	Id string `json:"id" db:"id"`
	Date db.NullableDate `json:"date" db:"date"`
    ProfileId string `json:"profileId" db:"profile_id"`
	TimeSlotProfile TimeSlotProfileJSON `json:"timeSlotProfile" db:"time_slot_profile"`
}

type DateSlotJSON struct{
	DateSlot
}
func (instance *DateSlotJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := DateSlotJSON{
		DateSlot: DateSlot{},
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